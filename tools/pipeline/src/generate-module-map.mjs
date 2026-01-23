import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.mjs";
import { generateModuleMap, writeModuleMap } from "./module-map.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..", "..");

const resolveOutputPath = () => path.join(repoRoot, "data", "meta", "module_map.json");

const run = async () => {
  await loadEnv();
  const outputPath = resolveOutputPath();
  const moduleMap = await generateModuleMap({
    owner: process.env.GITHUB_OWNER || undefined,
    repo: process.env.GITHUB_REPO || undefined,
    branch: process.env.GITHUB_BRANCH || undefined,
    token: process.env.GITHUB_TOKEN || process.env.UE_GITHUB_PAT || undefined,
  });

  await writeModuleMap(outputPath, moduleMap);
  console.log(`module_map.json written to ${outputPath}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
