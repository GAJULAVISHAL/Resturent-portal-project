import { Context } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export async function AddItem(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const adminId = Number(c.get("userid"));
        if (isNaN(adminId)) {
            return c.json({ error: "Invalid admin ID." }, 400);
        }

        const { name, price, imageUrl, category, isAvailable } = await c.req.json();

        // Basic validation (optional but recommended)
        if (!name || !price || !imageUrl || !category ||!isAvailable) {
            return c.json({ error: "Missing required fields." }, 400);
        }

        const menuItem = await prisma.menuItems.create({
            data: {
                name,
                price,
                imageUrl,
                category,
                isAvailable,
                adminId,
            },
        });

        return c.json(menuItem, 201);
    } catch (error) {
        return c.json({ error: `Unable to create menu item. ${error}` }, 500);
    }
}

export async function UpdateItem(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const body = await c.req.json()
        const res = await prisma.menuItems.update({
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
        const res = await prisma.menuItems.delete({
            where: {
                id: Number(id)
            }
        })
        return c.json({
            msg: 'Item deleted successfully',
            data: res
        }, 200)
    } catch (e) {
        console.log(e)
        return c.json({
            msg: 'Error deleting item'
        }, 400)
    }
}

export async function GetMenu(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())
        const items = await prisma.menuItems.findMany({
            where:{
                adminId: Number(c.get("userid"))
            },
            select: {
                id: true,
                name: true,
                price: true,
                category: true,
                imageUrl: true  
            }
        })
        return c.json({
            items
        })
    } catch (e) {
        return c.json({
            msg: 'Error fetching menu items',
            error: e
        },400)
    }
}