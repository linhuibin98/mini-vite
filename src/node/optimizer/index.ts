import path from 'path';
import {build} from 'esbuild';
import { scanPlugin } from './scanPlugin';
import { green } from 'picocolors';
import { preBundlePlugin } from './preBundlePlugin';
import {PRE_BUNDLE_DIR} from '../constants';

export async function optimize(root: string) {
    // 1. 确定入口
    // TODO 先假设 入口是 src/main.tsx
    const entry = path.resolve(root, 'src/main.tsx');
    // 2. 从入口处扫描依赖
    const deps = new Set<string>();
    await build({
        entryPoints: [entry],
        bundle: true,
        write: false,
        plugins: [scanPlugin(deps)]
    })
    console.log(
        `${green('需要预构建的依赖')}:\n${[...deps]
          .map(green)
          .map((item) => `  ${item}`)
          .join('\n')}`
    );
    // 3. 依赖预构建
    await build({
        entryPoints: [...deps],
        write: true,
        bundle: true,
        format: 'esm',
        splitting: true,
        sourcemap: true,
        outdir: path.resolve(root, PRE_BUNDLE_DIR),
        plugins: [preBundlePlugin(deps)],
    })
}
