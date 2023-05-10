import { expect, Locator, Page } from '@playwright/test'
import { BasicPage } from './config'

export class RakutenPage extends BasicPage {
  readonly page: Page
  readonly link: string
  readonly searchBox: Locator
  readonly categoryItems: Locator
  readonly suggestContainer: Locator
  readonly suggestions: Locator

  constructor(page: Page) {
    super()
    this.page = page
    this.link = 'https://www.rakuten.co.jp/'
    this.searchBox = page.locator('#common-header-search-input')
    this.categoryItems = page.locator(
      'a[class*=container-cut-vertical-padding]'
    )
    this.suggestContainer = page.locator('[class^=suggestion-list--]')
    this.suggestions = page
      .locator('[class^=suggestion-item--]')
      .locator('[class^=content--]')
  }

  async goto() {
    await this.page.goto(this.link, { waitUntil: 'networkidle' })
  }

  async getStarted() {
    const url = this.page.url()
    if (url === this.link) return

    await this.goto()
    const visible = await this.searchBox.isVisible()
    expect(visible).toBe(true)
  }

  async typeInSearchKeyword(keyword: string) {
    await this.searchBox.type(keyword, { delay: this.typeDelay })
    await this.page.waitForTimeout(this.typeTimeout)
    const visible = await this.suggestContainer.isVisible()
    expect(visible).toBe(true)
  }

  async scrapeSuggestions() {
    const result = await this.suggestions.evaluateAll((sugs) =>
      sugs.map((s) => s.textContent || '')
    )
    expect(result).toBeDefined()

    return result
  }

  async screenshot(owner: string, keyword: string) {
    const date = new Date()
    const ymd = date.toISOString().split('T')[0]
    await this.suggestContainer.screenshot({
      path: `images/${ymd}_${owner}_${keyword}_rakuten.png`
    })
  }

  async scrape(keyword: string) {
    await this.getStarted()
    await this.typeInSearchKeyword(keyword)
    const sug = await this.scrapeSuggestions()
    return sug
  }
}
