# fact-keyword-checker

ブラウザを起動して実際に検索を行い、表示されるサジェストを取得します。
位置情報、UserAgent など設定可能なため、汎用性が高いと考え作成しました。

データの取得にはテスト E2E テストツールの Playwright を使用しています。

## 作成済みサイト

- Amazon
- Rakuten
- Yahoo Shopping

## インストール＆ファイル作成

モジュールのインストールと、ファイル作成が必要です。

    npm install
    npx playwright install chromium

※実行には、Chromium をインストールする必要があります。

一時的にスプレッドシートを DB として使用しています。
テスト終了時にスプレッドシートからキーワードを取得して job.json に保存します。
※現状の GAS の使用によりスプレッドシートの ID 指定不可。（下記 DB_ID 参照）

    echo "[{"owner":  "ecoflow","service":  "amazon","keyword":  "ポータブル電源"}]" > job.json
    echo "API_ENDPOINT=https://script.google.com/macros/s/AKfycbxniJQ7gXMQcjta-RxbPpPc5uAt_-yL9b9P_el36uJzGC9rYQP8G4k8LTfGyNBBC-SIjQ/exec" > .env

サンプルの DB は[こちら](https://docs.google.com/spreadsheets/d/1IYGb5nZdBPpRNJtnM2UrqP91sYqJbD8PUndwPcbtGCQ/edit?usp=sharing)から閲覧可能です。

## 実行

下記コマンドを実行。

    npx playwright test

下記コマンドでブラウザを立ち上げて実行

    npx playwright test --headed

[詳細](https://playwright.dev/docs/running-tests)

## ファイルストラクチャー

主要なファイルは下記の通りです。

```
├── images　　　　　　　　　スクショ（確認用）保存場所
├── job.json　　　　　　　　取得するキーワード置き場
├── lib　　　　　　　　　　　DBからGET,POST
│   └── db.ts
├── pages　　　　　　　　　　各サイトの置き場
│   ├── amazon.ts
│   ├── config.ts
│   ├── index.ts
│   ├── rakuten.ts
│   └── yahoo-shopping.ts
└── tests　　　　　　　　　　実行されるテストファイル置き場
    └── daily.spec.ts
```

pages では[page object model](https://playwright.dev/docs/pom)と、[test.extend](https://playwright.dev/docs/api/class-test#test-extend)に沿って作成してあります。

## GAS (Google-App-Script)

```js
/* = = = = = = = = = CONSTANTS = = = = = = = = = */
const SHEET_NAME = 'keyword-ranking'
const DB_ID = '1IYGb5nZdBPpRNJtnM2UrqP91sYqJbD8PUndwPcbtGCQ'

/* = = = = = = = = = HELPER = = = = = = = = = */
/**
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 */
function createTable(spreadsheet) {
  spreadsheet.insertSheet(SHEET_NAME)
}

/**
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 * @returns {boolean}
 */
function checkTable(spreadsheet) {
  const sp = spreadsheet.getSheetByName(SHEET_NAME)
  if (!sp) return false
  return true
}

/**
 * @param {string} recepient
 * @param {string} title
 * @param {string} body
 */
function sendNotification(recepient, title, body) {
  GmailApp.sendEmail(recepient, title, body)
}

/* = = = = = = = = = RESPONSE = = = = = = = = = */
/**
 * @param {string} message
 */
function notFound(message) {
  return respond({ status: 404, message })
}

function respond(val) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setContent(JSON.stringify(val, null, 2))
}

/* = = = = = = = = = MAIN = = = = = = = = = */
function doPost(e) {
  const jsdt = JSON.parse(e.postData.contents)
  const { keyword, service, owner, result } = jsdt

  if (!keyword) return notFound(`keyword is not defined`)
  if (!service) return notFound(`service is not defined`)
  if (!owner) return notFound(`service is not defined`)
  if (!result) return notFound(`service is not defined`)

  try {
    const spread = SpreadsheetApp.openById(DB_ID)
    if (!checkTable(spread)) createTable(spread)

    const page = spread.getSheetByName(SHEET_NAME)
    page.appendRow([
      new Date(),
      owner,
      service,
      keyword,
      JSON.stringify(result, null, 2)
    ])

    return respond(vals)
  } catch (e) {
    console.log(e)
    notFound('info@intd.jpはDBにアクセスできませんでした。')
  }
}

function doGet() {
  try {
    const spread = SpreadsheetApp.openById(DB_ID)
    if (!checkTable(spread)) createTable(spread)

    const job = spread.getSheetByName('job')
    const val = job.getDataRange().getValues()
    const label = val.shift()
    const res = val.map((x) => ({ owner: x[0], service: x[1], keyword: x[2] }))
    return respond(res)
  } catch {
    return notFound('Nothing happned')
  }
}
```
