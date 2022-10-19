import { ServerContext } from "./server/index";
import { blue, green } from "picocolors";
import { getShortName, slash } from "./utils";
import path from "path";

export function bindingHMREvents(serverContext: ServerContext) {
    const {root, ws, watcher} = serverContext;

    watcher.on('change', async (filePath) => {
        console.log(`✨${blue("[hmr]")} ${green(filePath)} changed`); 
        const { moduleGraph } = serverContext;
        // 清除模块依赖图中的缓存
        await moduleGraph.invalidateModule(filePath);
        // 向客户端发送更新消息
        ws.send({
            type: 'update',
            updates: [
                {
                    type: 'js-update',
                    timestamp: Date.now(),
                    path: slash(path.join('/', getShortName(filePath, root))),
                    acceptedPath: slash(path.join('/', getShortName(filePath, root))),
                }
            ],
        });
    });
}
