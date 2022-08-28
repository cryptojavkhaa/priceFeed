const puppeteer = require("puppeteer");

let browser;
(async () => {
  // Create an instance of the chrome browser
  browser = await puppeteer.launch({ headless: true });
  // Create a new page
  const [page] = await browser.pages();
  // Configure the navigation timeout
  //await page.setDefaultNavigationTimeout(0);
  await page.goto("https://complex.mn/market/WIHC-MNTC", {
    waitUntil: "load",
    timeout: 0,
  });
  await page.waitForFunction(`
  document.querySelector("div.css-1k8t7d9 > div:nth-child(1) > div > div.css-1sl8dhm > div >div.no-scroll > div > div> p:nth-child(1)")
     ?.textContent.trim()
  `);

  const askPrices = await page.$$eval(
    "div.css-1k8t7d9 > div:nth-child(1) > div > div.css-1sl8dhm > div >div.no-scroll > div > div",
    (node) =>
      node.map((el) => ({
        exchange: "complex",
        title: "ask_price",
        price: el.querySelector("p:nth-child(1)")?.textContent.trim(),
        amount: el.querySelector("p:nth-child(2)")?.textContent.trim(),
        total: el.querySelector("p:nth-child(3)")?.textContent.trim(),
        patched: el.querySelector(".patched")?.textContent || "Not patched.",
      }))
  );
  const bidPrices = await page.$$eval(
    "div.css-1k8t7d9 > div:nth-child(3) > div > div.css-1sl8dhm > div >div.no-scroll > div > div",
    (node) =>
      node.map((el) => ({
        exchange: "complex",
        title: "bid_price",
        price: el.querySelector("p:nth-child(1)")?.textContent.trim(),
        amount: el.querySelector("p:nth-child(2)")?.textContent.trim(),
        total: el.querySelector("p:nth-child(3)")?.textContent.trim(),
        patched: el.querySelector(".patched")?.textContent || "Not patched.",
      }))
  );
  console.log(askPrices[askPrices.length - 1]);
  //console.log(askPrices.length);
  console.log(bidPrices[0]);
  //console.log(bidPrices.length);
})()
  .catch((err) => console.error(err))
  .finally(() => browser?.close());
