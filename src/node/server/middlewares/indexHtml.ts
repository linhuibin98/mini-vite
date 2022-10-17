import {NextHandleFunction} from 'connect';
import { ServerContext } from '..';
import path from 'path';
import {pathExists, readFile} from 'fs-extra';

export function indexHtmlMiddleware(serverContext: ServerContext): NextHandleFunction {
    return async (req, res, next) => {
        if (req.url === '/') {
            const {root, plugins} = serverContext;
            // 默认使用项目根目录下的 index.html
            const indexHtmlPath = path.join(root, 'index.html');
            if (await pathExists(indexHtmlPath)) {
                let html = await readFile(indexHtmlPath, 'utf-8');
                // 通过执行插件的 transformIndexHtml 方法来对 HTML 进行自定义的修改
                for (const plugin of plugins) {
                    if (plugin.transformIndexHtml) {
                        html = await plugin.transformIndexHtml(html);
                    }
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                return res.end(html);
            }
        }
        return next();
    }
}

