import fs from 'fs';
import path from 'path';

// Only needed on Windows when WDAC blocks native rollup DLLs
if (process.platform === 'win32') {
  try {
    const wasmNative = path.resolve('node_modules/@rollup/wasm-node/dist/native.js');
    const wasmDir = path.resolve('node_modules/@rollup/wasm-node/dist/wasm-node');
    const targetNative = path.resolve('node_modules/rollup/dist/native.js');
    const targetWasmDir = path.resolve('node_modules/rollup/dist/wasm-node');

    if (fs.existsSync(wasmNative) && fs.existsSync(targetNative)) {
      fs.copyFileSync(wasmNative, targetNative);
      if (fs.existsSync(wasmDir)) {
        fs.cpSync(wasmDir, targetWasmDir, { recursive: true, force: true });
      }
    }
  } catch {
    // Fail silently
  }
}
