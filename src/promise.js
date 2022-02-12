class Promise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    this.status = Promise.PENDING;
    this.value = undefined;
    this.reason = undefined;

    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === Promise.PENDING) {
        this.status = Promise.FULFILLED;
        this.value = value;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    const reject = (reason) => {
      if (this.status === Promise.PENDING) {
        this.status = Promise.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;

    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === Promise.FULFILLED) {
        try {
          let x = onFulfilled(this.value);
            
          resolve(x);
        } catch (error) {
          reject(error);
        }
      }

      if (this.status === Promise.REJECTED) {
        try {
          let x = onRejected(this.reason);
          reject(x);
        } catch (error) {
          reject(error);
        }
      }

      if (this.status === Promise.PENDING) {
        this.onResolvedCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
            reject(x);
          } catch (error) {
            reject(error);
          }
        });
      }
    });
    return promise2
  }

  catch() {}

  finally() {}
}

Promise.race = () => {};

Promise.all = () => {};

Promise.allSettled = () => {};

Promise.try = () => {};

Promise.resolve = () => {};

Promise.reject = () => {};

module.exports = Promise;
