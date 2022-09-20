const { addExtra } = require("puppeteer-extra");
const puppeteerVanilla = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Cluster } = require("puppeteer-cluster");
const fs = require("fs");
const path = require("path");
const tele = require("./src/teleg");

const puppeteer = addExtra(puppeteerVanilla);
puppeteer.use(StealthPlugin());

const urls = [
  "https://www.coinhub.mn/trade?symbol=IHC_MNT",
  "https://trade.mn/exchange/IHC/MNT/",
];
const scrape = async () => {
  const cluster = await Cluster.launch({
    puppeteer,
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: 2,
    monitor: true,
    puppeteerOptions: {
      headless: true,
      args: ["--no-sandbox"],
    },
  });

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}:${err.message}`);
  });

  let askPrices = [];
  let bidPrices = [];
  let result = [];

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    if (url === urls[0]) {
      await page.waitForFunction(`
      document.querySelector("#trade-depth > div.column.no-wrap.depth-lists.font-12 > div.column.no-wrap > div.q-list.q-list--dense.depth-list.ask.column.no-wrap.overflow-hidden.reverse.color-grey2.white-color-grey1 > div:nth-child(1) > div.q-item__section.column.q-item__section--main.justify-center > div > div.col-4.col-grow.color-red")
         ?.textContent.trim()
      `);
      askPrices = await page.$$eval("#trade-depth .ask", (els) =>
        els.map((el) => ({
          exchange: "coinhub",
          title: "ask_price",
          price: el
            .querySelector("div.q-item__section>div>div:nth-child(1)")
            ?.textContent.trim(),
          amount: el
            .querySelector("div.q-item__section>div>div:nth-child(2)")
            ?.textContent.trim(),
          total: el
            .querySelector("div.q-item__section>div>div:nth-child(3)")
            ?.textContent.trim(),
          patched: el.querySelector(".patched")?.textContent || "Not patched.",
        }))
      );
      bidPrices = await page.$$eval("#trade-depth .bid", (els) =>
        els.map((el) => ({
          exchange: "coinhub",
          title: "bid_price",
          price: el
            .querySelector(
              "div:nth-child(1) >.q-item__section>div>div:nth-child(1)"
            )
            ?.textContent.trim(),
          amount: el
            .querySelector(
              "div:nth-child(1) >.q-item__section>div>div:nth-child(2)"
            )
            ?.textContent.trim(),
          total: el
            .querySelector(
              "div:nth-child(1) >.q-item__section>div>div:nth-child(3)"
            )
            ?.textContent.trim(),
          patched: el.querySelector(".patched")?.textContent || "Not patched.",
        }))
      );
      result.push(askPrices[1], bidPrices[1]);
    } else if (url === urls[1]) {
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
      result.push(askPrices[askPrices.length - 1], bidPrices[0]);
    } else {
      console.log("url is undefined");
    }
    return result;
  });

  try {
    const res1 = await cluster.execute(
      "https://www.coinhub.mn/trade?symbol=IHC_MNT"
    );
    const res2 = await cluster.execute("https://trade.mn/exchange/IHC/MNT/");
    let calc = Calculation(res2);
    let fee = 2;
    let date = new Date();

    if (calc.trade_coinhub - fee > 0 || calc.coinhub_trade - fee > 0) {
      //send notification to telegram bot
      let message = `${calc.date}
      %0Atrade_coinhub ${calc.trade_coinhub}% 
      %0Acoinhub_trade ${calc.coinhub_trade}%
      %0Apossible_amount ${calc.possible_amount}
      %0Aprofit ${calc.profit}MNT`;
      tele.sendNotif(message);
      // record json data to db.json
      fs.readFile(path.join(__dirname, "./db.json"), (err, data) => {
        if (err) throw err;
        let arr = JSON.parse(data);
        arr.push(calc);
        let newData = JSON.stringify(arr);
        fs.writeFileSync(path.join(__dirname, "./db.json"), newData);
      });
    } else {
      console.log("There is no positive chance.");
    }
    // store data to db.json for our bot
  } catch (err) {
    console.log(`Error crawling ${data}:${err.message}`);
  }

  console.log(result);

  //console.log(calc);
  //console.log("succesfully finished");

  await cluster.idle();
  await cluster.close();
};

const Calculation = (response) => {
  let res = [];
  let calc = {};
  let fee = 2;
  response.forEach((el) => {
    res.push({
      exchange: el.exchange,
      title: el.title,
      price: parseFloat(el.price),
      amount: parseFloat(el.amount.replace(/[^\d\.\-]/g, "")),
      total: parseFloat(el.total.replace(/[^\d\.\-]/g, "")),
      patched: el.patched,
    });
  });
  let date = new Date();
  res.forEach((element) => {
    if (element.title === "bid_price" && element.exchange !== "coinhub") {
      calc["coinhub_" + element.exchange] = (
        (1 - res[0].price / element.price) *
        100
      ).toFixed(2);
      calc["date"] = date;
      calc["possible_amount"] = (
        res[0].amount >= element.amount ? element.amount : res[0].amount
      ).toFixed(2);
      calc["profit"] =
        (1 - res[0].price / element.price) * 100 >= 0
          ? (
              (((1 - res[0].price / element.price) * 100 - fee) / 100) *
              element.amount
            ).toFixed(2)
          : (
              (((1 - res[0].price / element.price) * 100 - fee) / 100) *
              res[0].amount
            ).toFixed(2);
    }
    if (element.title === "bid_price" && element.exchange !== "trade") {
      calc["trade_" + element.exchange] = (
        (1 - res[2].price / element.price) *
        100
      ).toFixed(2);
      calc["date"] = date;
      calc["possible_amount"] = (
        res[2].amount >= element.amount ? element.amount : res[2].amount
      ).toFixed(2);
      calc["profit"] =
        1 - res[2].price / element.price >= 0
          ? (
              ((1 - res[0].price / element.price - fee) / 100) *
              element.amount
            ).toFixed(2)
          : (
              ((1 - res[0].price / element.price - fee) / 100) *
              res[0].amount
            ).toFixed(2);
    }
  });

  return calc;
};

module.exports = scrape;
