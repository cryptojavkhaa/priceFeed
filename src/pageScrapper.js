//scrapping the page
const fs = require("fs");
const path = require("path");

const scrapperObjects = {
  url: "https://www.logammulia.com/id/harga-emas-hari-ini",
  async scrapper(browser) {
    let page = await browser.newPage();
    console.log(`navigation to url ${this.url}`);
    await page.goto(this.url);
    await page.waitForSelector(".chart-info");
    let urls = await page.$$eval(".ci-child", (links) => {
      links = links.map((el) => {
        let title = el
          .querySelector("title")
          .innerText.toLowerCase()
          .replace(" ", "_");
        let value = el.querySelector(".text").innerText;
        return {
          [title]: value,
        };
      });
      return links;
    });
    console.log("data");
    console.log(urls);
    await browser.close();
  },
};

module.exports = scrapperObjects;
