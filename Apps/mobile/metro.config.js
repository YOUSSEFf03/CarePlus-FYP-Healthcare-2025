// Apps/mobile/metro.config.js
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo
config.watchFolders = [workspaceRoot];

// Resolve modules from the app and the root node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
];

// Keeps lookups predictable in monorepos
config.resolver.disableHierarchicalLookup = true;

module.exports = config;