import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveImageUpload } from "@/lib/upload";
import { amountInBaseCurrency, expenseSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return await createExpenseFromFormData(request);
    }

    const data = expenseSchema.parse(await request.json());
    const base = amountInBaseCurrency(data.amount, data.currency, data.exchangeRate);
    const expense = await prisma.expense.create({ data: { ...data, amountInBaseCurrency: base } });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "新增支出失败" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = expenseSchema.parse(body);
    const base = amountInBaseCurrency(data.amount, data.currency, data.exchangeRate);
    const expense = await prisma.expense.update({ where: { id: body.id }, data: { ...data, amountInBaseCurrency: base } });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "更新支出失败" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "删除支出失败" }, { status: 400 });
  }
}

async function createExpenseFromFormData(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get("paymentImage");

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "每次支出都必须上传支付凭证图片" }, { status: 400 });
  }
  if (!image.type.startsWith("image/")) {
    return NextResponse.json({ error: "支付凭证必须是图片文件" }, { status: 400 });
  }

  const payload = Object.fromEntries([...formData.entries()].filter(([key]) => key !== "paymentImage"));
  const data = expenseSchema.parse(payload);
  const attachmentUrl = await saveImageUpload(image, "expenses");
  const base = amountInBaseCurrency(data.amount, data.currency, data.exchangeRate);
  const expense = await prisma.expense.create({
    data: {
      ...data,
      amountInBaseCurrency: base,
      attachmentUrl
    }
  });
  return NextResponse.json(expense);
}
