import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@example.com'
  const adminPassword = hashSync('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      adminCode: 'ADMIN_CODE_123',
    },
  })
  console.log({ admin })

  // 3. Create Waiter User
  const waiterEmail = 'waiter@example.com'
  const waiterPassword = hashSync('waiter123', 10)

  const waiter = await prisma.user.upsert({
    where: { email: waiterEmail },
    update: {},
    create: {
      email: waiterEmail,
      name: 'John Waiter',
      password: waiterPassword,
      role: 'WAITER',
      adminId: admin.id,
    },
  })
  console.log({ waiter })

  // 4. Create Kitchen User
  const kitchenEmail = 'kitchen@example.com'
  const kitchenPassword = hashSync('kitchen123', 10)

  const kitchen = await prisma.user.upsert({
    where: { email: kitchenEmail },
    update: {},
    create: {
      email: kitchenEmail,
      name: 'Chef Gordon',
      password: kitchenPassword,
      role: 'KITCHEN',
      adminId: admin.id,
    },
  })
  console.log({ kitchen })

  // 5. Create Tables for the Admin
  // Create tables 1-10
  const tablesData = Array.from({ length: 10 }, (_, i) => ({
    number: i + 1,
    capacity: 4,
    adminId: admin.id,
    status: 'AVAILABLE' as const, // Uses the Enum
  }))

  for (const t of tablesData) {
    // Only create if it doesn't exist (using unique constraint on number + adminId would be better if upsert supported it easily for composite keys without @@id, but here we can just try/catch or find first)
    // Prisma upsert needs a unique identifier. Our schema has @@unique([number, adminId]).
    
    // We can use upsert with the composite unique key
    const table = await prisma.table.upsert({
      where: {
        number_adminId: {
          number: t.number,
          adminId: t.adminId
        }
      },
      update: {},
      create: t,
    })
    console.log(`Table ${table.number} created/updated`)
  }

  // 6. Create Categories and Menu Items
  const menuData = [
    {
      name: "Starter",
      items: [
        { name: "Spring Rolls", price: 150, imageUrl: "https://images.unsplash.com/photo-1544025162-d76690b6d029?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
        { name: "Garlic Bread", price: 120, imageUrl: "https://images.unsplash.com/photo-1573140247632-f84660f67627?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
      ]
    },
    {
      name: "Main Course",
      items: [
        { name: "Butter Chicken", price: 350, imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
        { name: "Paneer Tikka Masala", price: 320, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
      ]
    },
    {
      name: "Dessert",
      items: [
        { name: "Gulab Jamun", price: 100, imageUrl: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
        { name: "Ice Cream", price: 80, imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
      ]
    },
    {
      name: "Drinks",
      items: [
        { name: "Cola", price: 50, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
        { name: "Lassi", price: 80, imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
      ]
    }
  ]

  for (const categoryData of menuData) {
    const category = await prisma.category.upsert({
      where: {
        name_adminId: {
          name: categoryData.name,
          adminId: admin.id
        }
      },
      update: {},
      create: {
        name: categoryData.name,
        adminId: admin.id
      }
    })
    console.log(`Category ${category.name} created/updated`)

    for (const item of categoryData.items) {
      // MenuItems doesn't have a unique name constraint exposed in validation?
      // Schema: `model MenuItems`. No @@unique on name?
      // Let's check schema again. 
      // I don't see @@unique([name, adminId]) on MenuItems loop.
      // But typically we want to avoid duplicates.
      // I'll search for existing first or just use create if I don't care about dupes, 
      // but repeatable seed matches `upsert`.
      
      // Since I don't have a unique key to upsert on solely for MenuItems (id is auto), 
      // I will do findFirst -> update or create.
      
      const existingItem = await prisma.menuItems.findFirst({
        where: {
          name: item.name,
          adminId: admin.id
        }
      })

      if (existingItem) {
        await prisma.menuItems.update({
          where: { id: existingItem.id },
          data: {
            price: item.price,
            imageUrl: item.imageUrl,
            categoryId: category.id
          }
        })
        console.log(`MenuItem ${item.name} updated`)
      } else {
        await prisma.menuItems.create({
          data: {
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            categoryId: category.id,
            adminId: admin.id,
          }
        })
        console.log(`MenuItem ${item.name} created`)
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
