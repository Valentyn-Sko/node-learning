import { HttpError } from "../httpError.ts";
import type { Params } from "../router.ts";

export function matchPath(pattern: string, pathname: string): Params | null {
  const p = pattern.split("/").filter(Boolean);
  const s = pathname.split("/").filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Params = {};
  for (let i = 0; i < p.length; i++) {
    const part = p[i]!;
    const value = s[i]!;
      if (part.startsWith(":")) {
          try {
              params[part.slice(1)] = decodeURIComponent(value);
          } catch (error) {
              throw new HttpError(400, 'Некорректная кодировка в URL')
          }
          
      }
    else if (part !== value) return null;
  }
  return params;
}
