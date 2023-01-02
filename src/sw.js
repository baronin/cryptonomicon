let worker = new SharedWorker("./main.js");
worker.port.addEventListener(
  "message",
  (e) => {
    console.log("SharedWorker", e.data);
  },
  false
);
worker.port.start();
worker.port.postMessage("start");
