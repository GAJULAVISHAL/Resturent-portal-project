import { Context } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { menuHasher } from '../utils/hash';

export async function AddItem(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const payload = c.get('payload');
        const adminId = Number(payload.id);
        
        if (isNaN(adminId)) {
            return c.json({ error: "Invalid admin ID." }, 400);
        }

        const { name, price, imageUrl, categoryId } = await c.req.json();

        // Basic validation (optional but recommended)
        if (!name || !price || !imageUrl || !categoryId) {
            return c.json({ error: "Missing required fields." }, 400);
        }

        const menuItem = await prisma.menuItems.create({
            data: {
                name,
                price,
                imageUrl,
                categoryId: Number(categoryId),
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
                isAvailable: body.isAvailable,
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

        const payload = c.get('payload');
        
        const availableParam = c.req.query('available');
        
        let adminId: number;
        if (payload.role === 'ADMIN'){
            adminId = Number(payload.id);
        } else {
            adminId = Number(payload.adminId);
        }

        // Build the 'where' object dynamically so that we can conditionally add filters
        const whereClause: any = {
            adminId: adminId
        };

        // If the query param exists and is true add the filter
        if (availableParam === 'true') {
            whereClause.isAvailable = true;
        }

        const items = await prisma.menuItems.findMany({
            where: whereClause, 
            select: {
                id: true,
                name: true,
                price: true,
                category: true,
                imageUrl: true,
                isAvailable: true 
            },
            orderBy: {
                name: 'asc' 
            }
        })

        return c.json({
            items
        }, 200)

    } catch (e) {
        return c.json({
            msg: 'Error fetching menu items',
            error: e
        }, 400)
    }
}

export async function GetPublicMenu(c: Context) {
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())
        const id = c.req.query('id')
        console.log("Received ID for public menu:", id);
        const adminId = menuHasher.decode(id || "")[0]
        
        const Availableitems = await prisma.menuItems.findMany({
            where:{
                adminId: adminId,
                isAvailable: true
            },
            select: {
                id: true,
                name: true,
                price: true,
                category: true,
                imageUrl: true,
                isAvailable: true 
            }
        })

        return c.json({
            Availableitems
        },200)
    }catch(e){
        return c.json({
            msg :"Error Fetching Available Menu Items",
            error: e
        },400)
    }
}

export async function UploadImage(c: Context) {
    try {
        const formData = await c.req.formData();
        const file = formData.get('file');

        if (!file) {
            return c.json({ error: 'No file provided' }, 400);
        }

        // We assume CLOUDINARY_NAME and CLOUDINARY_PRESET are set in wrangler.toml or .env
        const cloudinaryName = c.env.CLOUDINARY_NAME ;
        const cloudinaryPreset = c.env.CLOUDINARY_PRESET ;

        const cloudinaryData = new FormData();
        cloudinaryData.append('file', file);
        cloudinaryData.append('upload_preset', cloudinaryPreset);
        cloudinaryData.append('cloud_name', cloudinaryName);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`, {
            method: 'POST',
            body: cloudinaryData,
        });

        const result: any = await response.json();

        if (!response.ok) {
            return c.json({ error: 'Failed to upload image to Cloudinary', details: result }, 500);
        }

        return c.json({ secure_url: result.secure_url }, 200);
    } catch (e) {
        console.error("Error uploading image:", e);
        return c.json({ error: 'Error uploading image' }, 500);
    }
}