const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tell Metro to recognize .sql files as source code extensions
config.resolver.sourceExts.push("sql");

module.exports = config;
