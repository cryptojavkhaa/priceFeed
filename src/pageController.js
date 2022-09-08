// read page in browser
const pageScrapper = require("./pageScrapper");

async function scrapeAll(browserInstance) {
  let cluster;
  try {
    cluster = await browserInstance;
    await pageScrapper.scrapper(cluster);
  } catch (err) {
    console.log("error on resolve the browser instance", err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
