import path from "node:path";
import fs from "node:fs/promises";
import module from "node:module";
import process from "node:process";

const require = module.createRequire(import.meta.url);
const packageJson = require("./package.json");

console.log("run:", `common-creation/${packageJson.name}@${packageJson.version}`);

const { QUICKOPS_BASE_URL, QUICKOPS_TOKEN, LSCBUILD_CWD, LSCBUILD_ENV_FILE, QUICKOPS_KVS_MODE, QUICKOPS_KVS_KEY, QUICKOPS_KVS_VALUE, QUICKOPS_KVS_ENVFILE, QUICKOPS_KVS_ENVNAME } = process.env;
if (!QUICKOPS_BASE_URL) {
  throw new Error("missing environment variable: 'QUICKOPS_BASE_URL'");
}
if (!QUICKOPS_TOKEN) {
  throw new Error("missing environment variable: 'QUICKOPS_TOKEN'");
}
if (!LSCBUILD_CWD) {
  throw new Error("missing environment variable: 'LSCBUILD_CWD'");
}
if (!QUICKOPS_KVS_MODE) {
  throw new Error("missing environment variable: 'QUICKOPS_KVS_MODE'");
}
if (!["GET", "SET"].includes(QUICKOPS_KVS_MODE)) {
  throw new Error("invalid environment variable: 'QUICKOPS_KVS_MODE', must be 'GET' or 'SET': " + QUICKOPS_KVS_MODE);
}
if (!QUICKOPS_KVS_KEY) {
  throw new Error("missing environment variable: 'QUICKOPS_KVS_KEY'");
}
if (QUICKOPS_KVS_MODE === "SET" && QUICKOPS_KVS_VALUE == null) {
  throw new Error("missing environment variable: 'QUICKOPS_KVS_VALUE'");
}

let setValue = QUICKOPS_KVS_VALUE || "";
if (setValue.startsWith("$")) {
  if (setValue.startsWith("$$")) {
    setValue = process.env["$" + setValue.substring(2)] || "";
  } else {
    setValue = process.env[setValue.substring(1)] || "";
  }
}

console.log(QUICKOPS_KVS_MODE, QUICKOPS_KVS_KEY, setValue || "");

const endpoint = `${QUICKOPS_BASE_URL}/v1/context/kvs`;
let value;

for (let i = 1; i <= 5; i++) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${QUICKOPS_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": `common-creation_${packageJson.name}/${packageJson.version}`,
      },
      body: JSON.stringify({
        mode: QUICKOPS_KVS_MODE,
        key: QUICKOPS_KVS_KEY,
        value: QUICKOPS_KVS_MODE === "SET" ? setValue : undefined,
      }),
    });
    const body = await res.json();
    value = body.value;
    break;
  } catch (err) {
    console.error(err);
    await new Promise((resolve) => setTimeout(resolve, 1000 * (i * i)));
  }
  if (i === 5) {
    throw new Error("failed to set kvs");
  }
}

if (QUICKOPS_KVS_MODE === "GET") {
  const envFile = QUICKOPS_KVS_ENVFILE || LSCBUILD_ENV_FILE || "";
  let exportName = QUICKOPS_KVS_ENVNAME || QUICKOPS_KVS_KEY;
  if (exportName.startsWith("$")) {
    if (exportName.startsWith("$$")) {
      exportName = process.env["$" + setValue.substring(2)] || "";
    } else {
      exportName = process.env[setValue.substring(1)] || "";
    }
  }
  const envFilePath = envFile.startsWith(".") ? path.resolve(LSCBUILD_CWD, envFile) : envFile;
  await fs.appendFile(envFilePath, `\n${exportName}=${value || ""}\n`, {
    encoding: "utf-8",
  });
}
