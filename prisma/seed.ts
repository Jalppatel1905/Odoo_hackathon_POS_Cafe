import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.orderPayment.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pOSSession.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.floorTable.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.paymentMethodConfig.deleteMany();
  await prisma.user.deleteMany();

  // Categories
  await prisma.productCategory.createMany({
    data: [
      { id: "cat-1", name: "Quick Bites", color: "#ffd43b", sequence: 1 },
      { id: "cat-2", name: "Drinks", color: "#74c0fc", sequence: 2 },
      { id: "cat-3", name: "Desert", color: "#f783ac", sequence: 3 },
      { id: "cat-4", name: "Food", color: "#69db7c", sequence: 4 },
    ],
  });
  console.log("Created 4 categories");

  // Products
  await prisma.product.createMany({
    data: [
      { id: "p1", name: "Burger", categoryId: "cat-1", price: 15, unit: "Unit", tax: 5, description: "Classic beef burger" },
      { id: "p2", name: "Pizza", categoryId: "cat-4", price: 250, unit: "Unit", tax: 5, description: "Cheese pizza" },
      { id: "p3", name: "Maggie", categoryId: "cat-1", price: 70, unit: "Unit", tax: 5, description: "Instant noodles" },
      { id: "p4", name: "Fries", categoryId: "cat-1", price: 120, unit: "Unit", tax: 5, description: "French fries" },
      { id: "p5", name: "Sandwich", categoryId: "cat-1", price: 150, unit: "Unit", tax: 5, description: "Club sandwich" },
      { id: "p6", name: "Coffee", categoryId: "cat-2", price: 50, unit: "Unit", tax: 5, description: "Hot coffee" },
      { id: "p7", name: "Tea", categoryId: "cat-2", price: 35, unit: "Unit", tax: 5, description: "Masala tea" },
      { id: "p8", name: "Diet Coke", categoryId: "cat-2", price: 70, unit: "Unit", tax: 5, description: "Diet coke can" },
      { id: "p9", name: "Fanta", categoryId: "cat-2", price: 60, unit: "Unit", tax: 5, description: "Fanta orange" },
      { id: "p10", name: "Milkshake", categoryId: "cat-2", price: 140, unit: "Unit", tax: 5, description: "Chocolate milkshake" },
      { id: "p11", name: "Pasta", categoryId: "cat-4", price: 200, unit: "Unit", tax: 5, description: "Penne pasta" },
      { id: "p12", name: "Green Tea", categoryId: "cat-2", price: 65, unit: "Unit", tax: 5, description: "Japanese green tea" },
      { id: "p13", name: "Water", categoryId: "cat-2", price: 30, unit: "Unit", tax: 5, description: "Mineral water" },
    ],
  });
  console.log("Created 13 products");

  // Payment config
  await prisma.paymentMethodConfig.create({
    data: { id: "pmc-1", cash: true, digital: true, upi: false, upiId: "" },
  });
  console.log("Created payment method config");

  // Floor
  await prisma.floor.create({
    data: { id: "floor-1", name: "Ground Floor", posTerminal: "SipSync" },
  });
  await prisma.floorTable.createMany({
    data: [
      { id: "t1", number: 1, seats: 4, active: true, floorId: "floor-1" },
      { id: "t2", number: 2, seats: 2, active: true, floorId: "floor-1" },
      { id: "t3", number: 3, seats: 6, active: true, floorId: "floor-1" },
      { id: "t4", number: 4, seats: 4, active: true, floorId: "floor-1" },
      { id: "t5", number: 5, seats: 8, active: true, floorId: "floor-1" },
    ],
  });
  console.log("Created floor with 5 tables");

  // Customers
  await prisma.customer.createMany({
    data: [
      { id: "cust-1", name: "Eric", email: "eric@odoo.com", phone: "+91 9898989898", totalSales: 2000 },
      { id: "cust-2", name: "Smith", email: "smith@odoo.com", phone: "+91 8787878787", totalSales: 1500 },
    ],
  });
  console.log("Created 2 customers");

  console.log("Seeding complete!");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
