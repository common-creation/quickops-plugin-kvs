import module from "node:module";

const require = module.createRequire(import.meta.url);
const packageJson = require("./package.json");

console.log("finalize:", `common-creation/${packageJson.name}@${packageJson.version}`);