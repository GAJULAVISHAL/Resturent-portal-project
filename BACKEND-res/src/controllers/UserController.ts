import { Context } from "hono";
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

            c.set('userid', adminUser.id)
            const token = await sign(payload, c.env.SECRETKEY_JWT)

            return c.json({
                message: 'Admin signup successful',
                adminCode: newAdminCode,
                ROLE: adminUser.role,
                token: token
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
            c.set('userid', staffUser.adminId)
            const token = await sign(payload, c.env.SECRETKEY_JWT)

            return c.json({
                message: 'User signup successful',
                user: staffUser,
                ROLE: staffUser.role,
                token: token
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

        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return c.json({ error: 'User Dont exisit' }, 401)
        }

        // Compare the provided password with the stored hashed password
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
            return c.json({ error: 'Invalid credentials' }, 401)
        }

        // Generate a JWT token for the user

        let payload;
        if (user.role === 'ADMIN') {
            payload = {
                id: user.id,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
            }
        } else {
            payload = {
                id: user.adminId,
                role: user.role,
                adminId : user.adminId,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
            }
        }
        
        const token = await sign(payload, c.env.SECRETKEY_JWT)
        if (!token) {
            return c.json({ error: 'Error generating token' }, 500)
        }

        return c.json({ message: 'Sign in successful', token, ROLE: user.role }, 200)
    } catch (error: any) {
        return c.json({ error: 'Error signing in', details: error.message }, 500)
    }

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