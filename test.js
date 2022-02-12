const IPromise = require("./src/promise");

let p = new IPromise((resolve, reject) => {
  resolve(123);
});

  p.then(
    (value) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // resolve("success")
          reject('fail')
        }, 1000);
      })
    },
    (reason) => {
      console.log("reason", reason);
    }
  ).then(
    (value) => {
      console.log("value", value);
    },
    (reason) => {
      console.log("reason", reason);
    }
  )
