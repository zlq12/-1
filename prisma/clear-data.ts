import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.salesRecord.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.partner.deleteMany();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("All business data has been cleared.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
