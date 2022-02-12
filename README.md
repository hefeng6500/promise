# Promise

Promises/A+: https://promisesaplus.com/

[译]Promise/A+ 规范: https://zhuanlan.zhihu.com/p/143204897

1. 基本 Promise
   执行器
   resolve, reject, then(同步)
   resolve(异步，基于发布订阅)

2. then 链式调用 `p.then().then();`

基本链式调用：在 then 里面返回 promise

需要考虑 then return 的是 promise 还是普通值
x 如果是 promise 则，需要考虑调用 resolve 还是 reject
x 如果是普通值， 则调用 resolve

## 一、创建 Promise 类

```js
class Promise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    this.status = Promise.PENDING;
    this.value = undefined;
    this.reason = undefined;
  }

  then(onFulfilled, onRejected) {}
}
```

## 二、实现 resolve 和 reject

```js
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

  then(onFulfilled, onRejected) {}
}
```

## 三、实现 then 方法

1. 基础 then 方法(同步)

```js
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
    if (this.status === Promise.FULFILLED) {
      onFulfilled(this.value);
    }
    if (this.status === Promise.REJECTED) {
      onFulfilled(this.value);
    }
  }
}
```

2. 异步 resolve 时，实现异步

基于发布订阅

```js
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
    if (this.status === Promise.FULFILLED) {
      onFulfilled(this.value);
    }
    if (this.status === Promise.REJECTED) {
      onFulfilled(this.value);
    }
    if (this.status === Promise.PENDING) {
      this.onResolvedCallbacks.push(() => {
        onFulfilled(this.value);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}
```

3. then 链式调用

then 链式调用 `p.then().then();`

then 函数中需要返回一个 promise

基本链式调用：在 then 里面返回 promise

需要考虑 then return 的是 promise 还是普通值
x 如果是 promise 则，需要考虑调用 resolve 还是 reject
x 如果是普通值， 则调用 resolve

```js
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
}
```

**resolvePromise(promise2, x, resolve, reject);**

这个函数功能： 利用 x 的值判断 promise2 是 resolve 还是 reject

**x === promise2 的判断主要针对下面这个情况**

```js
if (x === promise2) {
  reject(
    new TypeError(`TypeError: Chaining cycle detected for promise #<Promise>`)
  );
}
```

```js
let promise = new Promise(() => {
  resolve(1);
}).then(() => {
  return promise;
});
```

**let then = x.then;**

这里为什么使用 try...catch...？

在获取别人的 Promise 时，可能不让获取 promise.then，
下面使用 `then.call(x, ()=>{}, ()=>{})` 而不使用 `x.then(()=>{}, ()=>{})` 同样是为了防止取用别人的 Promise 是不让获取 then 属性。

**called**

设置加锁，防止别人的 promise 不遵守 "状态改变后不可再修改"的承诺，可以多次修改状态


