/**
 * Returns the correct asset path, prepending the base path when deploying
 * to a sub-directory (e.g. GitHub Pages at /form-snap).
 *
 * Usage:
 *   import { assetPath } from '@/lib/asset-path';
 *   <Image src={assetPath('/form-snap.svg')} ... />
 *
 * In development (no NEXT_PUBLIC_BASE_PATH set), returns the path unchanged.
 * In GitHub Pages demo build, NEXT_PUBLIC_BASE_PATH=/form-snap is injected at
 * build time, so the function prepends /form-snap to every path.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function assetPath(src: string): string {
  if (!BASE_PATH || src.startsWith('http')) return src;
  // Avoid double-prefix
  if (src.startsWith(BASE_PATH)) return src;
  return `${BASE_PATH}${src}`;
}
