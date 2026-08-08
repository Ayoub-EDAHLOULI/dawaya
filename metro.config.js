const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tell Metro to recognize .sql as source code
config.resolver.sourceExts.push("sql");

// Tell Metro to recognize .wasm as a binary asset for web SQLite
config.resolver.assetExts.push("wasm");

// Force Metro to use transpiled modules that Hermes supports
config.resolver.unstable_enablePackageExports = false;

// Add COEP and COOP headers so the browser exposes SharedArrayBuffer,
// which expo-sqlite's web (WASM) backend requires.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    middleware(req, res, next);
  };
};

module.exports = config;
