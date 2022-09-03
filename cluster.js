const { addExtra } = require("puppeteer-extra");
const puppeteerVanilla = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Cluster } = require("puppeteer-cluster");

const puppeteer = addExtra(puppeteerVanilla);
puppeteer.use(StealthPlugin());

const urls = [
  "https://www.idax.exchange/mn_MN/newTrade/IHC_MNT/",
  "https://complex.mn/market/WIHC-MNTC",
  "https://trade.mn/exchange/IHC/MNT/",
];
const scrape = async () => {
  const cluster = await Cluster.launch({
    puppeteer,
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 3,
    puppeteerOptions: {
      headless: true,
      defaultViewport: false,
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
      timeout: 60000,
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
          patched: el.querySelector(".patched")?.textContent || "Not patched.",
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

  console.log(result);
  console.log(Calculation(result));
  console.log("succesfully finished");

  await cluster.idle();
  await cluster.close();
};

const Calculation = (response) => {
  let res = [];
  let calc = {};
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

  res.forEach((element) => {
    if (element.title === "bid_price" && element.exchange !== "idax") {
      calc["idax_" + element.exchange] =
        ((1 - res[0].price / element.price) * 100).toFixed(2) + "%";
    }
    if (element.title === "bid_price" && element.exchange !== "complex") {
      calc["complex_" + element.exchange] =
        ((1 - res[2].price / element.price) * 100).toFixed(2) + "%";
    }
    if (element.title === "bid_price" && element.exchange !== "trade") {
      calc["trade_" + element.exchange] =
        ((1 - res[4].price / element.price) * 100).toFixed(2) + "%";
    }
  });

  return calc;
};

scrape();
