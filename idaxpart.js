const idax = async (page) => {
  await page.waitForFunction(
    `document.querySelector(
            ".trade-table-list-container.asks > div.tbody > div > div > div > div.tbodyBar > div > div:nth-child(21) > span.td-symbol.u-4-cl > b"
          )
          ?.textContent.trim()`
  );

  const askPrices = await page.$$eval(".asksOPtion .symbol-item", (node) =>
    node.map((el) => ({
      exchange: "idax",
      title: "ask_price",
      price: el.querySelector(".td-symbol b")?.textContent.trim(),
      amount: el.querySelector(".td-price")?.textContent.trim(),
      total: el.querySelector(".td-rose")?.textContent.trim(),
      patched: el.querySelector(".patched")?.textContent || "Not patched.",
    }))
  );
  const bidPrices = await page.$$eval(
    ".trade-table-list-container.buy .symbol-item",
    (node) =>
      node.map((el) => ({
        exchange: "idax",
        title: "bid_price",
        price: el.querySelector(".td-symbol b").textContent.trim(),
        amount: el.querySelector(".td-price").textContent.trim(),
        total: el.querySelector(".td-rose").textContent.trim(),
        patched: el.querySelector(".patched")?.textContent || "Not patched.",
      }))
  );
  const data = [];
  data.push(askPrices[askPrices.length - 1], bidPrices[0]);
  return data;
};

module.exports = idax;
