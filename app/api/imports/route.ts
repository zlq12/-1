import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { autoMapHeaders, detectSource } from "@/lib/import/mapping";
import { parseImportFile } from "@/lib/import/parser";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "请上传 CSV 或 Excel 文件" }, { status: 400 });
  const sheets = await parseImportFile(file);
  const selected = sheets[0];
  const source = detectSource(selected.headers);
  const mapping = autoMapHeaders(selected.headers);
  const batch = await prisma.importBatch.create({
    data: {
      fileName: file.name,
      source,
      status: "mapping",
      rowCount: selected.rows.length,
      originalHeaders: selected.headers as Prisma.InputJsonValue,
      mappingConfig: mapping as Prisma.InputJsonValue,
      previewRows: selected.rows.slice(0, 20) as Prisma.InputJsonValue,
      rawRows: selected.rows as Prisma.InputJsonValue
    }
  });
  return NextResponse.json({ id: batch.id });
}
