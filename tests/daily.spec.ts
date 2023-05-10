import { test as base } from '@playwright/test'

import { AmazonPage, RakutenPage, YahooShoppingPage } from '../pages'
import { Job, generateJobs, uploadData } from '../lib/db'
import jobs from '../job.json'

const test = base.extend<{
  amazonPage: AmazonPage
  rakutenPage: RakutenPage
  yahooShoppingPage: YahooShoppingPage
}>({
  amazonPage: async ({ page }, use) => {
    const amazon = new AmazonPage(page)
    await use(amazon)
  },
  rakutenPage: async ({ page }, use) => {
    const rakuten = new RakutenPage(page)
    await use(rakuten)
  },
  yahooShoppingPage: async ({ page }, use) => {
    const yShopping = new YahooShoppingPage(page)
    await use(yShopping)
  }
})

!(async () => {
  for (const { keyword, service, owner } of jobs as Job[]) {
    test.describe(`「${keyword}」`, () => {
      const title = `サジェスト取得（${service.toUpperCase()}）`

      test(title, async ({ amazonPage, rakutenPage, yahooShoppingPage }) => {
        let result: string[] = []

        switch (service) {
          case 'amazon':
            result = await amazonPage.scrape(keyword)
            await amazonPage.screenshot(owner, keyword)
            break

          case 'rakuten':
            result = await rakutenPage.scrape(keyword)
            await rakutenPage.screenshot(owner, keyword)
            break

          case 'yahoo-shopping':
            result = await yahooShoppingPage.scrape(keyword)
            await yahooShoppingPage.screenshot(owner, keyword)
            break
        }

        await uploadData({ keyword, service, owner, result })
      })
    })
  }

  await generateJobs()
})()
