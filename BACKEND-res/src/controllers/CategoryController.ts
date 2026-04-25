import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { Context } from "hono"

export async function AddCategory(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())
        
        const payload = c.get('payload');
        const adminId = Number(payload.id);
        if (isNaN(adminId)) {
            return c.json({ error: "Invalid admin ID." }, 400);
        }

        const { name } = await c.req.json()
        if(!name){
            return c.json({
                msg: 'Category name is required'
            },400)
        }

        const existingCategory = await prisma.category.findUnique({
            where: { name_adminId: { name: name, adminId: adminId } }
        })
        if (existingCategory) {
            return c.json({
                msg: 'Category already exists'
            }, 400)
        }
        const category = await prisma.category.create({
            data: {
                name,
                adminId: adminId
            }
        })
        return c.json({ 
            success: true,
            category 
        }, 201)
    } catch (e) {
        return c.json({
            msg: 'Error adding category'
        })
    }
}

export async function GetCategories(c:Context){
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())
        const payload = c.get('payload');
        const adminId = Number(payload.id);
        if(isNaN(adminId)){
            return c.json({error: "Invalid admin ID."}, 400);
        }
        const categories = await prisma.category.findMany({
            where: { adminId: adminId }
        })
        return c.json({
            success: true,
            categories
        }, 200)
    }catch(e){
        return c.json({
            msg: 'Error fetching categories'
        })  
    }
}

export async function DeleteCategory(c:Context){
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())
        const payload = c.get('payload');
        const adminId = Number(payload.id);
        if(isNaN(adminId)){
            return c.json({error: "Invalid admin ID."}, 400);
        }
        const id  = await c.req.param('id')
        await prisma.category.delete({
            where:{
                id: Number(id)
            }
        })
        return c.json({
            success: true
        },200)
    }catch(e){
        console.error("FAILED TO DELETE CATEGORY:", e)
        return c.json({
            success: false
        },400)
    }
}
