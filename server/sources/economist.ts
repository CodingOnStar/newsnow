// The Economist RSS 订阅源
// https://www.economist.com/rss

const world = defineRSSSource("https://www.economist.com/the-world-this-week/rss.xml")

const business = defineRSSSource("https://www.economist.com/business/rss.xml")

const finance = defineRSSSource("https://www.economist.com/finance-and-economics/rss.xml")

const science = defineRSSSource("https://www.economist.com/science-and-technology/rss.xml")

const culture = defineRSSSource("https://www.economist.com/culture/rss.xml")

export default defineSource({
  "economist": world,
  "economist-world": world,
  "economist-business": business,
  "economist-finance": finance,
  "economist-science": science,
  "economist-culture": culture,
})
