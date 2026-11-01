const fs = require('fs');

if (process.platform === 'win32') {
  const origSync = fs.mkdirSync;
  fs.mkdirSync = function (dirPath, options) {
    let attempts = 0;
    while (true) {
      try {
        return origSync.call(fs, dirPath, options);
      } catch (err) {
        if ((err.code === 'EPERM' || err.code === 'EBUSY') && attempts < 25) {
          attempts++;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
          continue;
        }
        throw err;
      }
    }
  };

  const origMkdir = fs.mkdir;
  fs.mkdir = function (dirPath, ...args) {
    let cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    let opts = args[0] !== undefined ? args[0] : {};

    if (!cb) {
      return origMkdir.call(fs, dirPath, opts);
    }

    let attempts = 0;
    function attempt() {
      origMkdir.call(fs, dirPath, opts, (err, result) => {
        if (err && (err.code === 'EPERM' || err.code === 'EBUSY') && attempts < 25) {
          attempts++;
          setTimeout(attempt, 50);
        } else {
          cb(err, result);
        }
      });
    }
    attempt();
  };

  if (fs.promises && fs.promises.mkdir) {
    const origPromises = fs.promises.mkdir;
    fs.promises.mkdir = async function (dirPath, options) {
      let attempts = 0;
      while (true) {
        try {
          return await origPromises.call(fs.promises, dirPath, options);
        } catch (err) {
          if ((err.code === 'EPERM' || err.code === 'EBUSY') && attempts < 25) {
            attempts++;
            await new Promise((r) => setTimeout(r, 50));
            continue;
          }
          throw err;
        }
      }
    };
  }
}
