import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applyMapping, buildDuplicateKey } from "@/lib/import/mapping";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const strategy = body.duplicateStrategy || "skip";
  const batch = await prisma.importBatch.findUnique({ where: { id } });
  if (!batch) return NextResponse.json({ error: "导入批次不存在" }, { status: 404 });
  const rows = Array.isArray(batch.rawRows) ? (batch.rawRows as Record<string, unknown>[]) : [];
  const mapping = body.mappingConfig || batch.mappingConfig || {};
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    try {
      const record = applyMapping(rows[index], mapping);
      if (!record.sku) throw new Error("缺少 SKU");
      const duplicateKey = buildDuplicateKey(batch.source, record);
      const data: Prisma.SalesRecordUncheckedCreateInput = {
        ...record,
        currency: record.currency,
        rawData: record.rawData as Prisma.InputJsonValue,
        source: batch.source,
        importBatchId: id,
        duplicateKey
      };
      if (strategy === "overwrite") {
        await prisma.salesRecord.upsert({ where: { duplicateKey }, update: data, create: data });
      } else if (strategy === "create_new") {
        await prisma.salesRecord.create({ data: { ...data, duplicateKey: `${duplicateKey}|${id}|${index}` } });
      } else {
        await prisma.salesRecord.create({ data });
      }
      await prisma.product.upsert({
        where: { sku_asin_marketplace: { sku: record.sku, asin: record.asin || "", marketplace: record.marketplace || "" } },
        update: { parentProductName: record.parentProductName, childProductName: record.childProductName, storeName: record.storeName, variationType: record.variationType, variationValue: record.variationValue },
        create: { sku: record.sku, asin: record.asin || "", marketplace: record.marketplace || "", parentAsin: record.parentAsin, parentProductName: record.parentProductName, childProductName: record.childProductName, storeName: record.storeName, variationType: record.variationType, variationValue: record.variationValue }
      });
      successCount += 1;
    } catch (error) {
      if (String(error).includes("Unique constraint") && strategy === "skip") {
        continue;
      }
      failedCount += 1;
      errors.push(`第 ${index + 2} 行：${error instanceof Error ? error.message : "导入失败"}`);
    }
  }

  await prisma.importBatch.update({ where: { id }, data: { status: failedCount ? "failed" : "imported", successCount, failedCount, mappingConfig: mapping, errorMessage: errors.join("\n") || null } });
  return NextResponse.json({ successCount, failedCount, errors });
}
