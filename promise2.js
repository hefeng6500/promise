/**
 * 1、实现基本的 Promise
 *
 * 2、实现 ecextor 执行器，resolve， reject
 *
 * 3、实现基本的 then 方法，只包含同步
 *
 * 4、实现异步 resolve，then 方法的处理
 *
 * 5、实现 then 方法的链式调用
 *
 *      考虑 return 返回是普通值还是 promise
 *      普通值：直接返回
 *      promise，返回 promise 的状态
 *
 */

const { resolve } = require("./src/promise");

function resolvePromise(promise, x, resolve, reject) {
  // console.log(promise, x, resolve, reject);

  /**
   * let promise = new Promise((resolve) => {
   *    resolve(1)
   * }).then(() => {
   *    return promise
   * })
   */
  if (x === promise) {
    reject(
      new TypeError("TypeError: Chaining cycle detected for promise #<Promise>")
    );
  }

  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // promise

    // 加锁，防止别人的 promise 不遵守 "状态一旦被修改不可再变化"
    let called = false;

    // 使用 try 是防止 别人的 promise 不可以直接读取 then
    try {
      let then = x.then;

      if (typeof then === "function") {
        // 使用 then.call 也是为了防止 别人的 promise 不可以直接读取 then 或者说再次读取then
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
        // 可能是带有 then 的普通对象 { then: {} }
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 普通值
    resolve(x);
  }
}
class Promise {
  static PENDING = "pending";
  static RESOLVED = "resolved";
  static REJECTED = "rejected";

  constructor(executor) {
    this.status = Promise.PENDING;
    this.value = undefined;
    this.reason = undefined;

    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === Promise.PENDING) {
        this.status = Promise.RESOLVED;
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
    } catch (error) {
      reject(error);
    }
  }

  then(onFulFilled, onRejected) {
    onFulFilled =
      typeof onFulFilled === "function" ? onFulFilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === Promise.RESOLVED) {
        setTimeout(() => {
          try {
            let x = onFulFilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.status === Promise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.status === Promise.PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulFilled(this.value);
              // resolve(x);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }
}

let p = new Promise((resolve, reject) => {
  resolve(1);
});

p.then(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // resolve("success");
      reject("fail");
    }, 0);
  });
}).then(
  (value) => {
    console.log("value", value);
  },
  (reason) => {
    console.log("reason", reason);
  }
);
