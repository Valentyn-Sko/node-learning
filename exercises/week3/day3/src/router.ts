import type { IncomingMessage, ServerResponse } from "http";
import { matchPath } from "./helpers/matchPath.helper.ts";

export type Params = Record<string, string>;
export type Handler = (ctx: {
    req: IncomingMessage; res: ServerResponse; params: Params; url: URL;
}) => Promise<void> | void;

interface Route { method: string; pattern: string; handler: Handler; }

export class Router {
    private routes: Route[] = [];
    get(pattern: string, handler: Handler) {
        this.routes.push({ method: 'GET', pattern, handler })
    };

    post(pattern: string, handler: Handler) {
        this.routes.push({ method: 'POST', pattern, handler })
    };

    delete(pattern: string, handler: Handler) {
        this.routes.push({ method: 'DELETE', pattern, handler })
    };

    find(method: string, pathname: string): { handler: Handler; params: Params } | { allowed: string[] } | null {
        const allowed: string[] = [];
        for (const r of this.routes) {
            const params = matchPath(r.pattern, pathname);
            if (!params) continue;
            if (r.method === method) return { handler: r.handler, params };
            allowed.push(r.method);
            console.log(r.method, r.pattern, params)
        }
        return allowed.length ? { allowed } : null;
    }
}