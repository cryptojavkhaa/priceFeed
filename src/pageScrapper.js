//scrapping the page
const fs = require("fs");
const path = require("path");
const tele = require("./teleg");

const scrapperObject = {
  // url: "https://www.logammulia.com/id/harga-emas-hari-ini",
  url: "https://www.google.com",
  async scrapper(browser) {
    let page = await browser.newPage();
    console.log(`navigation to url ${this.url}`);
    await page.goto(this.url, {
      waitUntil: "load",
      timeout: 0,
    });
    await page.waitForSelector(".vcVZ7d");
    let urls = await page.$$eval(".vcVZ7d", (links) => {
      links = links.map((el) => {
        let title = el.querySelector("#SIvCob").innerText.toLowerCase();
        let value = el.querySelector("a").innerText;
        return {
          [title]: value,
        };
      });
      console.log("value is returned:", links);
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

module.exports = scrapperObject;
