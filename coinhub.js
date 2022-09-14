const puppeteer = require("puppeteer");

let browser;
(async () => {
  // Create an instance of the chrome browser

  browser = await puppeteer.launch({ headless: false });
  console.log("launching browser...");
  // Create a new page
  const [page] = await browser.pages();
  console.log("opening page...");
  // Configure the navigation timeout
  //await page.setDefaultNavigationTimeout(0);
  await page.goto("https://www.coinhub.mn/trade?symbol=IHC_MNT", {
    waitUntil: "load",
    timeout: 0,
  });
  console.log("waitForFunction");

  await page.waitForFunction(`
  document.querySelector("#trade-depth > div.column.no-wrap.depth-lists.font-12 > div.column.no-wrap > div.q-list.q-list--dense.depth-list.ask.column.no-wrap.overflow-hidden.reverse.color-grey2.white-color-grey1 > div:nth-child(1) > div.q-item__section.column.q-item__section--main.justify-center > div > div.col-4.col-grow.color-red")
     ?.textContent.trim()
  `);

  document.querySelector(
    "#trade-depth > div.column.no-wrap.depth-lists.font-12 > div.column.no-wrap > div.q-list.q-list--dense.depth-list.ask.column.no-wrap.overflow-hidden.reverse.color-grey2.white-color-grey1 > div:nth-child(2) > div.q-item__section.column.q-item__section--main.justify-center > div > div.col-4.col-grow.color-red"
  );

  console.log("askPrice is loading...");
  const askPrices = await page.$$eval("#trade-depth .ask", (els) =>
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
  console.log("bidPrice is loading...");

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
  console.log("ask:", askPrices);
  console.log("bid", bidPrices);

  console.log("successfully complete");
})()
  .catch((err) => console.error(err))
  .finally(() => browser?.close());
