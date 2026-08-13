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

  await prisma.partner.createMany({
    data: [
      { name: "张三", equityRatio: 50, note: "合伙人 A" },
      { name: "李四", equityRatio: 50, note: "合伙人 B" }
    ]
  });

  await prisma.store.createMany({
    data: [
      { name: "Amazon US Store", marketplace: "US", platform: "Amazon" },
      { name: "Amazon UK Store", marketplace: "UK", platform: "Amazon" }
    ]
  });

  const products = [
    ["Water Bottle", "Water Bottle Black 500ml", "WB-BLACK-500", "B000001", "Black", "500ml"],
    ["Water Bottle", "Water Bottle White 500ml", "WB-WHITE-500", "B000002", "White", "500ml"],
    ["Water Bottle", "Water Bottle Black 750ml", "WB-BLACK-750", "B000003", "Black", "750ml"],
    ["Storage Box", "Storage Box Small", "SB-SMALL", "B000004", "Size", "Small"],
    ["Storage Box", "Storage Box Large", "SB-LARGE", "B000005", "Size", "Large"]
  ];

  for (const [parentProductName, childProductName, sku, asin, variationType, variationValue] of products) {
    await prisma.product.create({
      data: { parentProductName, childProductName, sku, asin, parentAsin: parentProductName === "Water Bottle" ? "P-WB" : "P-SB", marketplace: "US", storeName: "Amazon US Store", variationType, variationValue }
    });
  }

  await prisma.investment.createMany({
    data: [
      { partnerName: "张三", type: "initial_investment", amount: 50000, currency: "CNY", amountInBaseCurrency: 50000, date: new Date("2026-04-01"), purpose: "启动资金" },
      { partnerName: "李四", type: "initial_investment", amount: 50000, currency: "CNY", amountInBaseCurrency: 50000, date: new Date("2026-04-01"), purpose: "启动资金" },
      { partnerName: "张三", type: "advance_payment", amount: 1200, currency: "CNY", amountInBaseCurrency: 1200, date: new Date("2026-04-10"), purpose: "样品费垫付" },
      { partnerName: "李四", type: "advance_payment", amount: 300, currency: "USD", exchangeRate: 7.2, amountInBaseCurrency: 2160, date: new Date("2026-05-02"), purpose: "广告费垫付" }
    ]
  });

  await prisma.expense.createMany({
    data: [
      { date: new Date("2026-04-05"), category: "product_purchase", amount: 20000, currency: "CNY", amountInBaseCurrency: 20000, payer: "张三", description: "首批产品采购" },
      { date: new Date("2026-04-18"), category: "first_leg_shipping", amount: 5000, currency: "CNY", amountInBaseCurrency: 5000, payer: "李四", description: "头程物流" },
      { date: new Date("2026-05-02"), category: "advertising", amount: 300, currency: "USD", exchangeRate: 7.2, amountInBaseCurrency: 2160, payer: "李四", description: "广告测试" },
      { date: new Date("2026-05-10"), category: "software", amount: 980, currency: "CNY", amountInBaseCurrency: 980, payer: "张三", description: "软件订阅" },
      { date: new Date("2026-06-01"), category: "sample", amount: 1200, currency: "CNY", amountInBaseCurrency: 1200, payer: "张三", description: "样品费" }
    ]
  });

  for (let month = 4; month <= 6; month += 1) {
    for (let i = 0; i < products.length; i += 1) {
      const [parentProductName, childProductName, sku, asin, variationType, variationValue] = products[i];
      const quantity = 20 + month * 4 + i * 6;
      const grossSales = quantity * (12 + i * 3);
      const refundAmount = i % 2 === 0 ? 12 : 0;
      await prisma.salesRecord.create({
        data: {
          source: "manual_template",
          storeName: "Amazon US Store",
          marketplace: "US",
          orderId: `SEED-${month}-${i}`,
          date: new Date(`2026-${String(month).padStart(2, "0")}-15`),
          parentProductName,
          childProductName,
          productName: childProductName,
          sku,
          asin,
          parentAsin: parentProductName === "Water Bottle" ? "P-WB" : "P-SB",
          variationType,
          variationValue,
          quantity,
          grossSales,
          refundAmount,
          netSales: grossSales - refundAmount,
          currency: "USD",
          sessions: quantity * 8,
          pageViews: quantity * 12,
          conversionRate: 0.12,
          unitsOrdered: quantity,
          rawData: { seed: true },
          duplicateKey: `seed|${month}|${sku}`
        }
      });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
