import { build } from "esbuild";
import { readFileSync, writeFileSync } from "fs";

const args = process.argv[2];
const settings = args ? JSON.parse(args) : {};

const entrypoint = settings.entrypoint ?? "./data/test/scripts/tests.ts";
const external = settings.external ?? ["@minecraft/server", "@minecraft/server-gametest"];
const gametestVersion = settings.gametestVersion ?? "1.0.0-beta";

const result = await build({
  bundle: true,
  entryPoints: [entrypoint],
  outfile: "./BP/scripts/tests.js",
  external,
  format: "esm",
});

if (result.errors.length > 0) {
  for (const error of result.errors) {
    console.error(error.text);
  }
  process.exit(1);
}

const mainJsPath = "./BP/scripts/main.js";
const mainJs = readFileSync(mainJsPath, "utf8");
writeFileSync(mainJsPath, `import "./tests.js";\n${mainJs}`);

const manifestPath = "./BP/manifest.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.dependencies.push({
  module_name: "@minecraft/server-gametest",
  version: gametestVersion,
});
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log("\x1b[34m[INFO]\x1b[0m Merged test scripts into main BP");
