import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from 'hono/jwt'
import { hashSync,compare } from "bcryptjs"


export async function Signup(c: Context){
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const body = await c.req.json()
    const isUserExist = await prisma.user.findFirst({
        where:{
            email : body.email
        }
    })

    if(isUserExist){
        return await c.json({
            msg : 'User Already exists'
        })
    }
    
    const hashsedPassword = await hashSync(body.password,10)
    const res = await prisma.user.create({
        data:{
            email : body.email,
            password : hashsedPassword,
            name : body.name,
            role : body.role
        }
    })
    
    const payload = {
        name : res.name,
        exp : Math.floor(Date.now() / 1000) + 60 * 60 * 24
    }
    const token = await sign(payload,c.env.SECRETKEY_JWT)

    return c.json({
        JWT : token,
    })
}

export async function Login(c: Context){
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const body = await c.req.json()
    const isUserExist = await prisma.user.findFirst({
        where:{
            email : body.email
        }
    })

    if(!isUserExist){
        return await c.json({
            msg : 'User not found'
        })
    }

    const isPasswordMatch = await compare(body.password,isUserExist.password)
    if(!isPasswordMatch){
        return await c.json({
            msg : 'Invalid Password'
        })
    }

    const payload = {
        name : isUserExist.name,
        exp : Math.floor(Date.now() / 1000) + 60 * 60 * 24
    }

    const token = await sign(payload,c.env.SECRETKEY_JWT)
    const role = isUserExist.role

    return c.json({
        Message : 'Login Success',
        JWT : token,
        ROLE : role
    })
}