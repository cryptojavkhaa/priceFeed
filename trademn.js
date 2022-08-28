const puppeteer = require("puppeteer");

let browser;
(async () => {
  browser = await puppeteer.launch({ headless: true });
  const [page] = await browser.pages();
  await page.goto("https://trade.mn/exchange/IHC/MNT/", {
    waitUntil: "load",
    timeout: 0,
  });
  await page.waitForFunction(`
    document.querySelector(".Balance_sell__YYumH .Balance_price__H0Z3x")
     ?.textContent.trim()
  `);
  const askPrices = await page.$$eval(
    ".Balance_sell__YYumH .Balance_item__GM8Oc",
    (els) =>
      els.map((el) => ({
        exchange: "trade",
        title: "ask_price",
        price: el.querySelector(".Balance_price__H0Z3x")?.textContent.trim(),
        amount: el.querySelector(".Balance_amount__L_QjT")?.textContent.trim(),
        total: el.querySelector(".Balance_total__UPh0U")?.textContent.trim(),
        patched: el.querySelector(".patched")?.textContent || "Not patched.",
      }))
  );
  const bidPrices = await page.$$eval(
    ".Balance_buy__0iV1f .Balance_item__GM8Oc",
    (els) =>
      els.map((el) => ({
        exchange: "trade",
        title: "bid_price",
        price: el.querySelector(" .Balance_price__H0Z3x")?.textContent.trim(),
        amount: el.querySelector(".Balance_amount__L_QjT")?.textContent.trim(),
        total: el.querySelector(".Balance_total__UPh0U")?.textContent.trim(),
        patched: el.querySelector(".patched")?.textContent || "Not patched.",
      }))
  );
  const data = [];
  data.push(askPrices[askPrices.length - 1], bidPrices[0]);
  console.log(data);
})()
  .catch((err) => console.error(err))
  .finally(() => browser?.close());
