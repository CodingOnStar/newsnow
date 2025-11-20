import process from "node:process"
import { load } from "cheerio"
import { myFetch } from "../utils/fetch"
import { md5 } from "../utils/crypto"
import { getSummaryCache } from "../database/cache"

export default defineEventHandler(async (event) => {
  const { url } = await readBody(event)
  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing URL",
    })
  }

  const urlHash = await md5(url)
  const cache = await getSummaryCache()
  if (cache) {
    const cached = await cache.get(urlHash)
    if (cached) {
      return cached
    }
  }

  try {
    // 1. Fetch HTML
    const html = await myFetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": new URL(url).origin,
      },
    })

    // 2. Parse and extract text
    const $ = load(html)
    // Remove scripts, styles, and other non-content elements
    $(
      "script, style, nav, footer, header, aside, iframe, .ad, .advertisement, .noprint",
    ).remove()

    let text = ""
    $("p, h1, h2, h3, h4, h5, h6, li").each((_, el) => {
      const t = $(el).text().trim()
      if (t.length > 20) {
        text += `${t}\n`
      }
    })

    // Truncate to avoid token limits (approx 4000 chars)
    text = text.slice(0, 8000)

    if (text.length < 100) {
      throw createError({
        statusCode: 422,
        statusMessage: "Could not extract enough content",
      })
    }

    // 3. Call AI API
    const apiKey = process.env.AI_API_KEY
    let baseURL = process.env.AI_BASE_URL || "https://api.openai.com/v1"
    const model = process.env.AI_MODEL || "gpt-3.5-turbo"

    if (baseURL.endsWith("/")) {
      baseURL = baseURL.slice(0, -1)
    }

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "AI_API_KEY not configured",
      })
    }

    const prompt = `
    请阅读以下文章内容，并生成一个 JSON 格式的摘要。
    JSON 格式要求：
    {
      "tldr": "一句话总结全文核心内容（50字以内）",
      "points": ["关键点1", "关键点2", "关键点3", "关键点4", "关键点5"]
    }
    
    文章内容：
    ${text}
    `

    const aiResponse = await myFetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: {
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful news summarizer. You output valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      },
    })

    const content = aiResponse.choices[0].message.content
    const result = JSON.parse(content)
    if (cache) {
      await cache.set(urlHash, result)
    }
    return result
  } catch (e: any) {
    console.error("Summary generation failed:", e)
    throw createError({
      statusCode: 500,
      statusMessage: e.message || "Failed to generate summary",
    })
  }
})
