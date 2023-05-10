import { expect, Locator, Page } from '@playwright/test'
import { BasicPage } from './config'

export class AmazonPage extends BasicPage {
  readonly page: Page
  readonly link: string
  readonly searchBox: Locator
  readonly suggestContainer: Locator
  readonly suggestions: Locator

  constructor(page: Page) {
    super()
    this.page = page
    this.link = 'https://www.amazon.jp/'
    this.searchBox = page.locator('#twotabsearchtextbox')
    this.suggestContainer = page.locator('#nav-flyout-searchAjax')
    this.suggestions = page.locator('.s-suggestion')
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
      path: `images/${ymd}_${owner}_${keyword}_amazon.png`
    })
  }

  async scrape(keyword: string) {
    await this.getStarted()
    await this.typeInSearchKeyword(keyword)
    const sug = await this.scrapeSuggestions()
    return sug
  }
}
