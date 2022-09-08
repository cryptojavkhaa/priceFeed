//scrapping the page
const fs = require("fs");
const path = require("path");
const tele = require("./teleg");
const cluster = require("./browser");

const urls = [
  "https://www.idax.exchange/mn_MN/newTrade/IHC_MNT/",
  "https://complex.mn/market/WIHC-MNTC",
  "https://trade.mn/exchange/IHC/MNT/",
];

const scrapperObject = {
  async scrapper(cluster) {
    let urls = await cluster.task(async ({ page, data: url }) => {
      console.log(`navigation to url ${this.url}`);
      await page.goto(this.url, {
        waitUntil: "networkidle2",
        timeout: 0,
      });

      if (url === urls[0]) {
        await page.waitForFunction(
          `document.querySelector(
                  ".trade-table-list-container.asks > div.tbody > div > div > div > div.tbodyBar > div > div:nth-child(21) > span.td-symbol.u-4-cl > b"
                )
                ?.textContent.trim()`
        );
        askPrices = await page.$$eval(".asksOPtion .symbol-item", (node) =>
          node.map((el) => ({
            exchange: "idax",
            title: "ask_price",
            price: el.querySelector(".td-symbol b")?.textContent.trim(),
            amount: el.querySelector(".td-price")?.textContent.trim(),
            total: el.querySelector(".td-rose")?.textContent.trim(),
            patched:
              el.querySelector(".patched")?.textContent || "Not patched.",
          }))
        );
        bidPrices = await page.$$eval(
          ".trade-table-list-container.buy .symbol-item",
          (node) =>
            node.map((el) => ({
              exchange: "idax",
              title: "bid_price",
              price: el.querySelector(".td-symbol b").textContent.trim(),
              amount: el.querySelector(".td-price").textContent.trim(),
              total: el.querySelector(".td-rose").textContent.trim(),
              patched:
                el.querySelector(".patched")?.textContent || "Not patched.",
            }))
        );
      } else if (url === urls[1]) {
        await page.waitForFunction(`
          document.querySelector("div.css-1k8t7d9 > div:nth-child(1) > div > div.css-1sl8dhm > div >div.no-scroll > div > div> p:nth-child(1)")
             ?.textContent.trim()
          `);
        askPrices = await page.$$eval(
          "div.css-1k8t7d9 > div:nth-child(1) > div > div.css-1sl8dhm > div >div.no-scroll > div > div",
          (node) =>
            node.map((el) => ({
              exchange: "complex",
              title: "ask_price",
              price: el.querySelector("p:nth-child(1)")?.textContent.trim(),
              amount: el.querySelector("p:nth-child(2)")?.textContent.trim(),
              total: el.querySelector("p:nth-child(3)")?.textContent.trim(),
              patched:
                el.querySelector(".patched")?.textContent || "Not patched.",
            }))
        );
        bidPrices = await page.$$eval(
          "div.css-1k8t7d9 > div:nth-child(3) > div > div.css-1sl8dhm > div >div.no-scroll > div > div",
          (node) =>
            node.map((el) => ({
              exchange: "complex",
              title: "bid_price",
              price: el.querySelector("p:nth-child(1)")?.textContent.trim(),
              amount: el.querySelector("p:nth-child(2)")?.textContent.trim(),
              total: el.querySelector("p:nth-child(3)")?.textContent.trim(),
              patched:
                el.querySelector(".patched")?.textContent || "Not patched.",
            }))
        );
      } else if (url === urls[2]) {
        await page.waitForFunction(`
          document.querySelector(".Balance_sell__YYumH .Balance_price__H0Z3x")
           ?.textContent.trim()
        `);
        askPrices = await page.$$eval(
          ".Balance_sell__YYumH .Balance_item__GM8Oc",
          (els) =>
            els.map((el) => ({
              exchange: "trade",
              title: "ask_price",
              price: el
                .querySelector(".Balance_price__H0Z3x")
                ?.textContent.trim(),
              amount: el
                .querySelector(".Balance_amount__L_QjT")
                ?.textContent.trim(),
              total: el
                .querySelector(".Balance_total__UPh0U")
                ?.textContent.trim(),
              patched:
                el.querySelector(".patched")?.textContent || "Not patched.",
            }))
        );
        bidPrices = await page.$$eval(
          ".Balance_buy__0iV1f .Balance_item__GM8Oc",
          (els) =>
            els.map((el) => ({
              exchange: "trade",
              title: "bid_price",
              price: el
                .querySelector(" .Balance_price__H0Z3x")
                ?.textContent.trim(),
              amount: el
                .querySelector(".Balance_amount__L_QjT")
                ?.textContent.trim(),
              total: el
                .querySelector(".Balance_total__UPh0U")
                ?.textContent.trim(),
              patched:
                el.querySelector(".patched")?.textContent || "Not patched.",
            }))
        );
      } else {
        console.log("url is undefined");
      }
      result.push(askPrices[askPrices.length - 1], bidPrices[0]);
      return result;
    });

    for (let url of urls) {
      await cluster.execute(url);
    }

    let date = new Date();
    let message = `Date is ${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()} and notification test text and response data is ${urls}`;

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
