import { Context } from "hono";
import { deleteCookie, setCookie } from 'hono/cookie' // Import the setCookie helper
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from 'hono/jwt'
import { hashSync, compare } from "bcryptjs"
import { v4 as uuidv4 } from 'uuid';

enum Role {
    ADMIN = 'ADMIN',
    WAITER = 'WAITER',
    KITCHEN = 'KITCHEN'
}

export async function Signup(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const { name, email, password, role, code } = await c.req.json()
        // If the user is an ADMIN
        if (role === 'ADMIN') {
            // Generate a unique admin code for the admin user
            const newAdminCode = uuidv4();
            const hashedPassword = await hashSync(password, 10);
            // Create the admin user with the generated admin code
            const adminUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword, // In production, hash the password before storing
                    role,
                    adminCode: newAdminCode,
                },
            });
            const payload = {
                id: adminUser.id,
                role: adminUser.role,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
            }


            const token = await sign(payload, c.env.SECRETKEY_JWT)

            setCookie(c, 'accessToken', token, {
                httpOnly: true,
                secure: c.env.NODE_ENV === 'production' ? true : false, // Use 'true' in production
                sameSite: c.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Use 'Strict' in production for better security
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return c.json({
                message: 'Admin signup successful',
                adminCode: newAdminCode,
                ROLE: adminUser.role,
            }, 200);
        } else {
            // For non-admin users, the adminCode must be provided in the request
            if (!code) {
                return c.json({ error: 'Admin code is required for non-admin users' }, 400);
            }

            // Verify that an admin with the given code exists
            const admin = await prisma.user.findUnique({
                where: { adminCode: code },
            });

            if (!admin) {
                return c.json({ error: 'Invalid admin code provided' }, 401);
            }

            const hashedPassword = await hashSync(password, 10);
            // Create the user and link to the found admin via adminId
            const staffUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword, // In production, hash the password before storing
                    role,
                    adminId: admin.id, // Associate this user awith the admin
                },
            });

            const payload = {
                id: staffUser.id,
                role: staffUser.role,
                adminId: staffUser.adminId,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
            }
            const token = await sign(payload, c.env.SECRETKEY_JWT)

            setCookie(c, 'accessToken', token, {
                httpOnly: true,
                secure: c.env.NODE_ENV === 'production' ? true : false, // Use 'true' in production
                sameSite: c.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Use 'Strict' in production for better security
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return c.json({
                message: 'User signup successful',
                ROLE: staffUser.role,
            }, 200);
        }
    } catch (error) {
        console.error('Signup error:', error);
        return c.json({ error: 'Internal server error', details: (error as Error).message }, 500);
    }
}


export async function Login(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const { email, password } = await c.req.json()

        if (!email || !password) {
            return c.json({ error: 'Missing email or password' }, 400)
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return c.json({ error: "User doesn't exist" }, 401)
        }

        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
            return c.json({ error: 'Invalid credentials' }, 401)
        }

        let payload;
        // Set expiration for 24 hours from now
        const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

        if (user.role === 'ADMIN') {
            payload = { id: user.id, role: user.role, exp }
        } else {
            payload = { id: user.id, role: user.role, adminId: user.adminId, exp }
        }

        const token = await sign(payload, c.env.SECRETKEY_JWT)
        if (!token) {
            return c.json({ error: 'Error generating token' }, 500)
        }

        console.log("Generated JWT:", token);

        // --- CHANGE IS HERE ---
        // Set the JWT as an httpOnly cookie instead of sending it in the body
        setCookie(c, 'accessToken', token, {
            httpOnly: true, // Prevents client-side JS from accessing the cookie
            secure: c.env.NODE_ENV === 'production' ? true : false,   // Ensures the cookie is sent only over HTTPS
            sameSite: c.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Mitigates CSRF attacks
            maxAge: 30 * 60 * 60 * 24, // Cookie expiration in seconds (24 hours)
            path: '/', // The cookie is available for all paths on your domain
        });

        console.log("Cookie set successfully");
        return c.json({ message: 'Sign in successful', ROLE: user.role }, 200)

    } catch (error: any) {
        return c.json({ error: 'Error signing in', details: error.message }, 500)
    }
}

export async function GetUserProfile(c: Context) {
     const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    // 1. Get the user ID set by the AuthMiddleware
    const payload = c.get('payload');
    const userId = payload.id;

    if(payload.role !== 'ADMIN'){
        return c.json({
            msg : "UnAuthorized"
        },401)
    }
    // This check is a safeguard, as the middleware should prevent this
    if (!userId) {
        return c.json({ error: 'User ID not found in context' }, 400);
    }

    try {
        // 3. Find the user in the database
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
            // 4. Select only the fields you want to send to the frontend
            // IMPORTANT: Never send the password hash or other sensitive data
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                adminCode : true,
            },
        });

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        // 5. Return the user data in the expected format
        return c.json({ user: user });

    } catch (e) {
        console.error("Error fetching user profile:", e);
        return c.json({ error: 'Failed to fetch user profile' }, 500);
    }
}

export async function Logout(c: Context) {
    deleteCookie(c, 'accessToken', {
        path: '/',
        secure: c.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true,
        sameSite: c.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    return c.json({ message: 'Logged out successfully' });
}
export async function GetUsers(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const users = await prisma.user.findMany({
        select: {
            name: true,
            role: true
        }
    })
    return c.json({
        Users: users
    })
}

