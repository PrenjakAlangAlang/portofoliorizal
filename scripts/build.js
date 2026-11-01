const path = require('path');
const patchPath = path.resolve(__dirname, 'patch-fs.js');

if (process.platform === 'win32') {
  require(patchPath);
  const existingNodeOptions = process.env.NODE_OPTIONS || '';
  if (!existingNodeOptions.includes('patch-fs.js')) {
    const formattedPath = patchPath.replace(/\\/g, '/');
    process.env.NODE_OPTIONS = `${existingNodeOptions} --require "${formattedPath}"`.trim();
  }
  process.env.NEXT_TEST_WASM_DIR = path.resolve(__dirname, '../node_modules/@next/swc-wasm-nodejs');
  process.argv = [process.argv[0], 'next', 'build', '--webpack', ...process.argv.slice(2)];
} else {
  process.argv = [process.argv[0], 'next', 'build', ...process.argv.slice(2)];
}

require('next/dist/bin/next');
