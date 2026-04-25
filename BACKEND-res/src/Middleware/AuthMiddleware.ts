import { Context , Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";

export async function AuthMiddleware(c: Context, next: Next) {
    let token = getCookie(c, 'accessToken');
    
    if (!token) {
        const authHeader = c.req.header("Authorization");
        if (authHeader) {
            token = authHeader; // Assuming the header is just the token, or "Bearer <token>"
        }
    }

    // console.log("Token from cookie/header:", token); // Debugging line
    try {
        if (!token) {
            c.status(401);
            return c.json({ error: 'Unauthorized: Token not found' });
        }

        const payload = await verify(token, c.env.SECRETKEY_JWT);
        if (!payload) {
            c.status(401);
            return c.json({ error: 'Unauthorized: Invalid token' });
        }
        
        // 3. Set the entire payload for use in subsequent routes
        c.set('payload', payload); 
        await next();

    } catch (e) {
        // This handles expired tokens and other verification errors
        c.status(401);
        return c.json({
            error: 'Unauthorized: Invalid or expired token'
        });
    }
}