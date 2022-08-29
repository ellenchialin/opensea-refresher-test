const puppeteer = require('puppeteer')
const chrome = require('chrome-aws-lambda')
const Cors = require('cors')

const cors = Cors({
  methods: ['POST', 'GET']
})

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// async function getBrowserInstance() {
//   const executablePath = await chromium.executablePath

//   if (!executablePath) {
//     // running locally
//     const puppeteer = require('puppeteer')
//     return puppeteer.launch({
//       args: chromium.args,
//       headless: true,
//       ignoreHTTPSErrors: true
//     })
//   }

//   return chromium.puppeteer.launch({
//     args: chromium.args,
//     executablePath,
//     headless: chromium.headless,
//     ignoreHTTPSErrors: true
//   })
// }

const exePath =
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function getOptions(isDev) {
  let options
  if (isDev) {
    options = {
      args: [],
      executablePath: exePath,
      headless: true
    }
  } else {
    options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless
    }
  }
  return options
}

export default async function handler(req, res) {
  const contractAddress = req.body.contractAddress
  const tokenId = req.body.tokenId
  // const isERC = req.body.isERC === 'yes'
  const isDev = req.query.isDev === 'true'

  try {
    // await runMiddleware(req, res, cors)

    if (req.method === 'POST') {
      const options = await getOptions(isDev)
      const browser = await puppeteer.launch(options)

      console.log('Launching new page...')
      const page = await browser.newPage()
      // await page.setUserAgent(
      //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36'
      // )

      console.log('Going to Opensea...')
      await page.goto(
        `https://testnets.opensea.io/assets/rinkeby/${contractAddress}/${tokenId}`
      )

      console.log('Wait 1 sec...')
      await pause(1000)
      // await page.waitForSelector('[value="refresh"]')

      console.log('Click refresh button')
      await page.click('[value="refresh"]')

      console.log(`Token ${tokenId} finished and ready to close browser...`)
      browser.close()

      res.status(200).json({ message: `TokenID ${tokenId} finished` })
    }
  } catch (error) {
    console.dir(error)
    res.status(500).json({ message: `Something went wrong! Error: ${error}` })
  }
}
