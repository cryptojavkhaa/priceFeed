//scrapping the page
const fs = require("fs");
const path = require("path");
const tele = require("./teleg");

const scrapperObject = {
  // url: "https://www.logammulia.com/id/harga-emas-hari-ini",
  url: "https://pagespeed.web.dev",
  async scrapper(browser) {
    let page = await browser.newPage();
    console.log(`navigation to url ${this.url}`);
    await page.goto(this.url, {
      waitUntil: "load",
      timeout: 0,
    });
    await page.waitForSelector(
      "#yDmH0d > c-wiz > div.T4LgNb > div > div.ZVTDqc > div.AXosle.C0pEce > section > div > h1"
    );
    let urls = await page.$$eval(
      "#yDmH0d > c-wiz > div.T4LgNb > div > div.ZVTDqc > div.AXosle.C0pEce > section",
      (links) => {
        links = links.map((el) => {
          let title = el
            .querySelector(
              "#yDmH0d > c-wiz > div.T4LgNb > div > div.ZVTDqc > div.AXosle.C0pEce > section > div > p"
            )
            .innerText.toLowerCase()
            .replace(" ", "_"); //Check_out
          let value = el
            .querySelector(
              "#yDmH0d > c-wiz > div.T4LgNb > div > div.ZVTDqc > div.AXosle.C0pEce > section > div > h1"
            )
            .innerText.toLowerCase()
            .replace(" ", "_"); //Make_your_web_pages_fast_on_all_devices
          return {
            [title]: value,
          };
        });
        return links;
      }
    );
    let date = new Date();
    // let updown = urls[1].change.includes("-")
    //   ? `decrease of ${urls[1].change}`
    //   : `increase of ${urls[1].change}`;
    let message = `Gold price today ${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()} is ${
      urls[0].check_out
    }, occur, so were building this with node js`;
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
