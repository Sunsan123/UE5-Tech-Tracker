export type ModuleChunkLoader<T> = () => Promise<{ default: T }>;

const chunkModules = import.meta.glob("./chunks/chunk_*.ts") as Record<
  string,
  ModuleChunkLoader<unknown>
>;

export const loadModuleChunk = async <T>(moduleId: string) => {
  const key = `./chunks/chunk_${moduleId}.ts`;
  const loader = chunkModules[key];
  if (!loader) {
    return null;
  }
  const module = await loader();
  return module.default as T;
};
