import path from "node:path";
import { generateModuleMap, writeModuleMap } from "./module-map.mjs";

const resolveOutputPath = () =>
  path.resolve(process.cwd(), "..", "..", "data", "meta", "module_map.json");

const run = async () => {
  const outputPath = resolveOutputPath();
  const moduleMap = await generateModuleMap({
    owner: process.env.GITHUB_OWNER || undefined,
    repo: process.env.GITHUB_REPO || undefined,
    branch: process.env.GITHUB_BRANCH || undefined,
    token: process.env.GITHUB_TOKEN || undefined,
  });

  await writeModuleMap(outputPath, moduleMap);
  console.log(`module_map.json written to ${outputPath}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
