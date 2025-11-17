// Reuters RSS 订阅源
// 使用 RSSHub 代理获取 Reuters 内容
// https://docs.rsshub.app/routes/traditional-media#reuters

const world = defineRSSHubSource("/reuters/world")

const business = defineRSSHubSource("/reuters/business")

const technology = defineRSSHubSource("/reuters/technology")

const markets = defineRSSHubSource("/reuters/markets")

const politics = defineRSSHubSource("/reuters/politics")

const sports = defineRSSHubSource("/reuters/sports")

const entertainment = defineRSSHubSource("/reuters/entertainment")

export default defineSource({
  "reuters": world,
  "reuters-world": world,
  "reuters-business": business,
  "reuters-technology": technology,
  "reuters-markets": markets,
  "reuters-politics": politics,
  "reuters-sports": sports,
  "reuters-entertainment": entertainment,
})
