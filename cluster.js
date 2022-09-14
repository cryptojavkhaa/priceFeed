const { addExtra } = require("puppeteer-extra");
const puppeteerVanilla = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Cluster } = require("puppeteer-cluster");

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
      timeout: 0,
    });

    if (url === urls[0]) {
      await page.waitForFunction(`
      document.querySelector("#trade-depth .ask")
       ?.textContent.trim()
    `);

      const askPrices = await page.$$eval("#trade-depth .ask", (els) =>
        els.map((el) => ({
          exchange: "coinhub",
          title: "ask_price",
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
      const bidPrices = await page.$$eval("#trade-depth .bid", (els) =>
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
  //console.log(Calculation(result));
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
