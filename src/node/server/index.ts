// connect 是一个具有中间件机制的轻量级 Node.js 框架。
// 既可以单独作为服务器，也可以接入到任何具有中间件机制的框架中，如 Koa、Express
import connect from 'connect';
// picocolors 是一个用来在命令行显示不同颜色文本的工具
import {blue, green} from 'picocolors';
import {optimize} from '../optimizer';
import {resolvePlugins} from '../plugins';
import {createPluginContainer, PluginContainer} from '../pluginContainer';
import {Plugin} from '../plugin';
import { indexHtmlMiddleware } from "./middlewares/indexHtml";
import { transformMiddleware } from "./middlewares/transform";
import { staticMiddleware } from "./middlewares/static";

// 服务器上下文类型
export interface ServerContext {
    root: string;
    pluginContainer: PluginContainer;
    app: connect.Server,
    plugins: Plugin[]
}

export async function startDevServer() {
    const app = connect();
    const root = process.cwd();
    const startTime = Date.now();
    const plugins = resolvePlugins();
    const pluginContainer = createPluginContainer(plugins);

    const serverContext: ServerContext = {
        root,
        app,
        pluginContainer,
        plugins
    };

    for (const plugin of plugins) {
        if (plugin.configureServer) {
            await plugin.configureServer(serverContext);
        }
    }

    app.use((req, res, next) => {
        console.log('收到请求', req.method, req.url);
        next();
    });
    // 处理入口 HTML 资源
    app.use(indexHtmlMiddleware(serverContext));
    // transform
    app.use(transformMiddleware(serverContext));
    // static 服务
    app.use(staticMiddleware(serverContext));

    app.listen(3000, async () => {
        await optimize(root);
        console.log(
            green("🚀 No-Bundle 服务已经成功启动!"),
            `耗时: ${Date.now() - startTime}ms`
          );
        console.log(`> 本地访问路径: ${blue("http://localhost:3000")}`);
    });
}

