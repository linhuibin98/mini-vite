

import path from 'path';
import {Plugin} from '../plugin';
import { ServerContext } from '../server';
import { cleanUrl, slash } from '../utils';

export function assetPlugin(): Plugin {
    let serverContext: ServerContext;
    return {
        name: 'm-vite:assets',
        configureServer(s) {
            serverContext = s;
        },
        async load(id) {
            const cleanedId = slash(path.join('/', path.relative(serverContext.root, cleanUrl(id))));
            // 这里仅处理 png
            if (cleanedId.endsWith('.png')) {
                return {
                    // 包装成一个 JS 模块
                    code: `export default "${cleanedId}";`
                }
            }
        }
    }
}
