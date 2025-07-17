import { Context , Next } from "hono";
import { verify } from "hono/jwt";

export async function AuthMiddleware(c: Context, next: Next) {
    const token = c.req.header('Authorization')|| "";
    try {
        if (!token) {
            c.status(401);
            return c.json({
                msg: 'Token not found'
            });
        }
        const payload = await verify(token, c.env.SECRETKEY_JWT);
        if (!payload) {
            c.status(401);
            return c.json({
                msg: 'Invalid Token'
            });
        }
        c.set('userid', payload.id); 
        await next();
        return c.res; // Ensure to return the response object
    } catch (e) {
        console.log("internal error", e);
        return c.json({
            msg: 'Internal Server Error'
        }, 500);
    }
}