import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const counts = {
    partners: await prisma.partner.count(),
    stores: await prisma.store.count(),
    products: await prisma.product.count(),
    investments: await prisma.investment.count(),
    expenses: await prisma.expense.count(),
    importBatches: await prisma.importBatch.count(),
    salesRecords: await prisma.salesRecord.count()
  };
  console.table(counts);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
