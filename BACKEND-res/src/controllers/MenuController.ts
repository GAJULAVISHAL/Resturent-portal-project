import { Context } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export async function AddItem(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const body = await c.req.json()
        const res = await prisma.menuItem.create({
            data: {
                name: body.name,
                price: body.price,
                category: body.category,
            }
        })
        return c.json({
            msg: 'Item added successfully',
            data: res
        })
    } catch (e) {
        console.log(e)
        return c.json({
            msg: 'Error adding item'
        })
    }
}

export async function UpdateItem(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const body = await c.req.json()
        const res = await prisma.menuItem.update({
            where: {
                id: body.id
            },
            data: {
                name: body.name,
                price: body.price,
                category: body.category,
            }
        })
        return c.json({
            msg: 'Item updated successfully',
            data: res
        })
    } catch (e) {
        return c.json({
            msg: 'Error updating item'
        })
    }
}

export async function DeleteItem(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const id = c.req.param("id")
        const res = await prisma.menuItem.delete({
            where: {
                id: Number(id)
            }
        })
        return c.json({
            msg: 'Item deleted successfully',
            data: res
        })
    } catch (e) {
        return c.json({
            msg: 'Error deleting item'
        })
    }
}

export async function GetMenu(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const items = await prisma.menuItem.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                category: true
            }
        })
        return c.json({
            items
        })
    }catch(e){
        return c.json({ 
            msg: 'Error fetching menu items'
        })
    }
}