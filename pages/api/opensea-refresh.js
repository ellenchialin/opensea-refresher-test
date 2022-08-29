const puppeteer = require('puppeteer')
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

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, cors)

    if (req.method === 'POST') {
      const contractAddress = req.body.contractAddress
      const tokenId = req.body.tokenId
      const isERC = req.body.isERC === 'yes'

      const browser = await puppeteer.launch()
      console.log('Launching new page...')

      const page = await browser.newPage()
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36'
      )

      console.log('Going to Opensea...')
      // TODO add isERC and url path logic
      await page.goto(
        `https://testnets.opensea.io/assets/rinkeby/${contractAddress}/${tokenId}`
      )

      console.log('Wait 1 sec...')
      // await pause(1000);
      await page.waitForSelector('[value="refresh"]')

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
