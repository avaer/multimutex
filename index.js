"use strict";

class MultiMutex {
  constructor() {
    this.mutexes = new Map();
  }

  lock(key, options) {
    let mutex = this.mutexes.get(key);
    if (!mutex) {
      mutex = new Mutex(key, this);
      this.mutexes.set(key, mutex);
    }

    return mutex.lock(options);
  }

  remove(key) {
    this.mutexes.delete(key);
  }
}

class Mutex {
  constructor(key, parent) {
    this._key = key;
    this._parent = parent;

    this.locked = false;
    this.queue = [];
  }

  lock(options = {}) {
    return new Promise((accept, reject) => {
      let timeout = options.timeout ? setTimeout(() => {
        this.queue.splice(this.queue.indexOf(_tryLock), 1);

        const err = new Error('mutex lock request timed out');
        reject(err);
      }, options.timeout) : null;

      const _tryLock = () => {
        if (!this.locked) {
          this.locked = true;

          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }

          accept(() => {
            this.unlock();
          });
        } else {
          this.queue.push(_tryLock);
        }
      };
      _tryLock();
    });
  }

  unlock() {
    this.locked = false;

    const next = this.queue.pop();
    if (next) {
      next();
    } else {
      this._parent.remove(this._key);
    }
  }
}

module.exports = MultiMutex;
