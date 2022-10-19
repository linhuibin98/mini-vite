import os from 'os';
import path from 'path';
import { JS_TYPES_RE, HASH_RE, QUERY_RE } from './constants';

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

export const isWindows = os.platform() === 'win32'

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}
/**
 * 清除链接上的 hash 和 query 参数
 * @param url 链接
 */
export function cleanUrl(url: string): string {
  return url.replace(HASH_RE, '').replace(QUERY_RE, '')
}

export function isJSRequest(id: string): boolean {
  id = cleanUrl(id);
  if (JS_TYPES_RE.test(id)) {
    return true;
  }
  if (!path.extname(id) && !id.endsWith('/')) {
    return true;
  }
  return false;
}

export function isCSSRequest(id: string) {
  return cleanUrl(id).endsWith('.css');
}

export function isImportRequest(url: string): boolean {
  return url.endsWith("?import");
}

export function getShortName(file: string, root: string) {
  return file.startsWith(root + "/") ? path.posix.relative(root, file) : file;
}
