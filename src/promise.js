// 利用 X 的值判断 promise2 是 resolve 还是 reject
function resolvePromise(promise2, x, resolve, reject) {
  // console.log(promise2, x, resolve, reject);

  // 考虑循环情况
  if (x === promise2) {
    reject(
      new TypeError(`TypeError: Chaining cycle detected for promise #<Promise>`)
    );
  }

  // 兼容其他 promise
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 加锁，防止别人的 promise 调了成功后还是可以调成功！
    let called = false;

    // 取别人的 x(Promise), x.then 时可能会抛出异常，所以用 try...catch...
    try {
      let then = x.then;

      if (typeof then === "function") {
        // 这里不使用 x.then 而使用 then.call(x) 也是防止取 p.then 时可能会抛出异常
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolve(y);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // x 可能是一个带有 then 属性的对象 { then: {} }
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 普通值,直接 resolve
    resolve(x);
  }
}

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
        // 为什么使用 setTimeout？
        // 使得 resolvePromise 中能够获取到 promise2
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);

            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status === Promise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status === Promise.PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });
    return promise2;
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
