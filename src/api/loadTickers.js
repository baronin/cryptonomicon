const API_KEY =
  "07491a0d00d7ece2c90a41446790815a43ee72b29e42ccff2ecb7147c1671675";

const tickersHandlers = new Map();

// TODO: refactor to use URLSearchParams
export const loadTickers = () => {
  console.log(tickersHandlers);

  debugger;
  if (tickersHandlers.size === 0) return;

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((r) => r.json())
    .then((rowData) => {
      const updatedPrice = Object.fromEntries(
        Object.entries(rowData).map(([key, value]) => [key, value.USD])
      );
      Object.entries(updatedPrice).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

setInterval(() => loadTickers(), 5000);
