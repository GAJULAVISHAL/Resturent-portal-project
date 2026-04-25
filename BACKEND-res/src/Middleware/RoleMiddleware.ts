import { Context, Next } from "hono";

export const RoleMiddleware = (allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
        const payload = c.get('payload');

        if (!payload || !allowedRoles.includes(payload.role)) {
            return c.json({ message: "Forbidden: Insufficient permissions" }, 403);
        }

        await next();
    };
};
