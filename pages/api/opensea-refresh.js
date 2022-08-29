const puppeteer = require('puppeteer-core')
const chrome = require('chrome-aws-lambda')

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const exePath =
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

export default async function handler(req, res) {
  const contractAddress = req.body.contractAddress
  const tokenId = req.body.tokenId

  try {
    if (req.method === 'POST') {
      const browser = await chrome.puppeteer.launch({
        args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
        executablePath: await chrome.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--disable-extensions']
      })

      console.log('Launching new page...')
      const page = await browser.newPage()
      page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36'
      )

      console.log('Going to Opensea...')
      await page.goto(
        `https://testnets.opensea.io/assets/rinkeby/${contractAddress}/${tokenId}`
      )

      // console.log('Wait 1 sec...')
      await pause(1000)
      // // await page.waitForSelector('[value="refresh"]')

      await page.click('[value="refresh"]')
      // console.log('Clicked refresh')

      // console.log('Taking screenshot...')
      // await page.screenshot({ path: 'example.png' })
      // await page.screenshot({ type: 'png' })

      console.log(`Token ${tokenId} finished and ready to close browser...`)
      browser.close()

      res.status(200).json({ message: `TokenID ${tokenId} finished` })
    }
  } catch (error) {
    console.dir(error)
    res.status(500).json({ message: `Something went wrong! Error: ${error}` })
  }
}
