//scrapping the page
const fs = require("fs");
const path = require("path");
const tele = require("./teleg");

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
          .querySelector(".title")
          .innerText.toLowerCase()
          .replace(" ", "_");
        let value = el.querySelector(".text").innerText;
        return {
          [title]: value,
        };
      });
      return links;
    });
    let date = new Date();
    let updown = urls[1].change.includes("-")
      ? `decrease of ${urls[1].change}`
      : `increase of ${urls[1].change}`;
    let message = `Gold price today ${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()} is ${
      urls[0].last_price
    }, occur ${updown}, so were building this with node js`;
    tele.sendNotif(message);

    // store data to db.json for our bot
    let data = JSON.stringify(urls);
    fs.writeFileSync(path.join(__dirname, "./../db.json"), data);
    console.log("data");
    console.log(urls);
    await browser.close();
  },
};

module.exports = scrapperObjects;
