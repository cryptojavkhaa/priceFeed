// for launching browser

// const puppeteer = require("puppeteer");

// async function startBrowser() {
//   let browser;

//   try {
//     console.log("starting the browser");
//     browser = await puppeteer.launch({
//       headless: true,
//       args: ["--disable-setuid-sandbox"],
//       ignoreHTTPSErrors: true,
//     });
//   } catch (err) {
//     console.log("error launching browser => ", err);
//   }
//   return browser;
// }

// module.exports = { startBrowser };

const { addExtra } = require("puppeteer-extra");
const puppeteerVanilla = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Cluster } = require("puppeteer-cluster");

const puppeteer = addExtra(puppeteerVanilla);
puppeteer.use(StealthPlugin());

const urls = [
  "https://www.idax.exchange/mn_MN/newTrade/IHC_MNT/",
  // "https://complex.mn/market/WIHC-MNTC",
  "https://trade.mn/exchange/IHC/MNT/",
];

async function startBrowser() {
  let cluster;

  try {
    console.log("starting the browser");
    cluster = await Cluster.launch({
      puppeteer,
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 3,
      monitor: true,
      puppeteerOptions: {
        headless: false,
        defaultViewport: false,
        args: ["--no-sandbox"],
      },
    });
  } catch (err) {
    console.log("error launching browser => ", err);
  }
  return cluster;
}
