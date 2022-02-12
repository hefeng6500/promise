const IPromise = require("./src/promise");

new IPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(123);
  }, 2000);
}).then(
  (value) => {
    console.log("value", value);
  },
  (reason) => {
    console.log("reason", reason);
  }
);
