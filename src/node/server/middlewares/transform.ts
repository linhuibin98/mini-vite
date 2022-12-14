import {NextHandleFunction} from 'connect';
import {isJSRequest, cleanUrl, isCSSRequest, isImportRequest} from '../../utils';
import {ServerContext} from '..';
import createDebug from 'debug';

const debug = createDebug('dev');

export async function transformRequest(url: string, serverContext: ServerContext) {
    const {pluginContainer, moduleGraph} = serverContext;
    url = cleanUrl(url);
    // 从缓存拿 transformResult
    const mod = await moduleGraph.getModuleByUrl(url);
    if (mod && mod.transformResult) {
        return mod.transformResult;
    }

    // 简单来说，就是依次调用插件容器的 resolveId、load、transform 方法
    const resolveResult = await pluginContainer.resolveId(url);
    let transformResult;
    if (resolveResult?.id) {
        let code = await pluginContainer.load(resolveResult.id);
        if (typeof code === 'object' && code !== null) {
            code = code.code;
        }
        // 初始化模块
        await moduleGraph.ensureEntryFromUrl(url);
        if (code) {
            transformResult = await pluginContainer.transform(code, resolveResult.id);
        }
    }

    // 缓存 transformResult
    if (mod) {
        mod.transformResult = transformResult;
    }
    
    return transformResult;
}

export function transformMiddleware(serverContext: ServerContext): NextHandleFunction {
    return async (req, res, next) => {
        if (req.method !== 'GET' || !req.url) {
            return next();
        }
        const url = req.url;
        debug("transformMiddleware: %s", url);
        // transform JS request
        if (isJSRequest(url) || isCSSRequest(url) || isImportRequest(url)) {
            // 核心编译函数
            let result = await transformRequest(url, serverContext);
            const code = typeof result === 'string' ? result : result?.code;
            if(!result || !code) {
                return next();
            }
            // 编译完成，返回响应给浏览器
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/javascript");
            return res.end(code);
        }
        next();
    };
}
