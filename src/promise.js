class Promise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    this.status = Promise.PENDING;
    this.value = undefined;
    this.reason = undefined;

    const resolve = (value) => {
      if (this.status === Promise.PENDING) {
        this.status = Promise.FULFILLED;
        this.value = value;
      }
    };
    const reject = (reason) => {
      if (this.status === Promise.PENDING) {
        this.status = Promise.REJECTED;
        this.reason = reason;
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    
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
