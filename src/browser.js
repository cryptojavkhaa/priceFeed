// for launching browser
const { addExtra } = require("puppeteer-extra");
const puppeteerVanilla = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Cluster } = require("puppeteer-cluster");

const puppeteer = addExtra(puppeteerVanilla);
puppeteer.use(StealthPlugin());

async function startBrowser() {
  console.log("starting the browser");
  const cluster = await cluster.launch({
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

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}:${err.message}`);
  });

  return cluster;
}

module.exports = { startBrowser };
