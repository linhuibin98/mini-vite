import {Plugin} from 'esbuild';
import {EXTERNAL_TYPES, BARE_IMPORT_RE} from '../constants';

export function scanPlugin(deps: Set<string>): Plugin {
    return {
        name: 'esbuild:scan-deps',
        setup(build) {
            // 忽略的文件类型
            build.onResolve(
                {
                    filter: new RegExp(`\\.(${EXTERNAL_TYPES.join('|')})$`)
                },
                (resolveInfo) => {
                    return {
                        path: resolveInfo.path,
                        // 打上 external 标记
                        external: true,
                    }
                }
            );
            // 收集第三方依赖，全部忽略构建
            build.onResolve(
                {
                    filter: BARE_IMPORT_RE
                },
                (resolveInfo) => {
                    const { path: id } = resolveInfo;
                    // 推入 deps 集合中
                    deps.add(id);
                    return {
                        path: id,
                        external: true,
                    };
                }
            )
        },
    }
}
