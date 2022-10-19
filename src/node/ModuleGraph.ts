import { PartialResolvedId, TransformResult } from "rollup";
import { cleanUrl } from "./utils";

export class ModuleNode {
  // 资源访问 url
  url: string;
  // 资源绝对路径
  id: string | null = null;
  // 被什么模块依赖
  importers = new Set<ModuleNode>();
  // 依赖的模块
  importedModules = new Set<ModuleNode>();
  transformResult: TransformResult | null = null;
  lastHMRTimestamp = 0;
  constructor(url: string) {
    this.url = url;
  }
}

export class ModuleGraph {
  // 资源 url 到 ModuleNode 的映射表
  urlToModuleMap = new Map<string, ModuleNode>();
  // 资源绝对路径到 ModuleNode 的映射表
  idToModuleMap = new Map<string, ModuleNode>();

  constructor(
    private resolveId: (url: string) => Promise<PartialResolvedId | null>
  ) {}

  getModuleById(id: string) {
    return this.idToModuleMap.get(id);
  }

  async getModuleByUrl(rawUrl: string) {
    const { url } = await this._resolve(rawUrl);
    return this.urlToModuleMap.get(url);
  }

  async ensureEntryFromUrl(rawUrl: string): Promise<ModuleNode> {
    const { url, resolvedId } = await this._resolve(rawUrl);
    // 首次检查缓存
    if (this.urlToModuleMap.has(url)) {
      return this.urlToModuleMap.get(url) as ModuleNode;
    }
    // 若无缓存，更新 urlToModuleMap 和 idToModuleMap
    const mod = new ModuleNode(url);
    mod.id = resolvedId;
    this.urlToModuleMap.set(url, mod);
    this.idToModuleMap.set(resolvedId, mod);
    return mod;
  }

  async updateModuleInfo(
    mod: ModuleNode,
    rawImportedModules: Set<string | ModuleNode>
  ) {
    const importedModules = new Set<ModuleNode>();
    // 添加新增的依赖模块
    for (const curImport of rawImportedModules) {
        const dep = 
            typeof curImport === 'string'
                ? await this.ensureEntryFromUrl(cleanUrl(curImport))
                : curImport;
        if (dep) {
            importedModules.add(dep);
            mod.importedModules.add(dep);
            dep.importers.add(mod);
        }
    }
    // 清除已经不再被引用的依赖
    const prevImports = [...mod.importedModules];
    for (const prevImport of prevImports) {
        if (!importedModules.has(prevImport)) {
            prevImport.importers.delete(mod);
            mod.importedModules.delete(prevImport);
        }
    }
  }

  // HMR 触发时会执行这个方法
  invalidateModule(file: string) {
    const mod = this.idToModuleMap.get(file);
    if (mod) {
        // 更新时间戳
        mod.lastHMRTimestamp = Date.now();
        mod.transformResult = null;
        mod.importers.forEach((importer) => {
            this.invalidateModule(importer.id!);
        });
    }
  }

  private async _resolve(url: string) {
    const resolveId = await this.resolveId(url);
    const resolvedId = resolveId?.id || url;
    return { url, resolvedId };
  }
}
