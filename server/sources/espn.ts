// ESPN RSS 订阅源
// ESPN 官方 RSS feeds
// https://www.espn.com/espn/rss/

const news = defineRSSSource("https://www.espn.com/espn/rss/news")

const nfl = defineRSSSource("https://www.espn.com/espn/rss/nfl/news")

const nba = defineRSSSource("https://www.espn.com/espn/rss/nba/news")

const mlb = defineRSSSource("https://www.espn.com/espn/rss/mlb/news")

const soccer = defineRSSSource("https://www.espn.com/espn/rss/soccer/news")

export default defineSource({
  "espn": news,
  "espn-news": news,
  "espn-nfl": nfl,
  "espn-nba": nba,
  "espn-mlb": mlb,
  "espn-soccer": soccer,
})
