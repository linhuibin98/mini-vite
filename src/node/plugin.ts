import type {LoadResult, PartialResolvedId, SourceDescription} from 'rollup';

import {ServerContext} from './server';

export type ServerHook = (
    server: ServerContext
) => (() => void) | void | Promise<() => void | void>;

// TODO 暂时实现以下几个勾子
export interface Plugin {
    name: string;
    configureServer?: ServerHook;
    resolveId?: (
        id: string,
        importer?: string,
    ) => Promise<PartialResolvedId | null> | PartialResolvedId | null,
    load?: (id: string) =>  Promise<LoadResult | null> | LoadResult | null,
    transform?: (
        code: string,
        id: string,
    ) => Promise<SourceDescription | null> | SourceDescription | null,
    transformIndexHtml?: (raw: string) => Promise<string> | string
}
