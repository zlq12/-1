import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveImageUpload } from "@/lib/upload";
import { amountInBaseCurrency, investmentSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return await createInvestmentFromFormData(request);
    }

    const data = investmentSchema.parse(await request.json());
    const base = amountInBaseCurrency(data.amount, data.currency, data.exchangeRate);
    const investment = await prisma.investment.create({ data: { ...data, amountInBaseCurrency: base } });
    return NextResponse.json(investment);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "新增投资失败" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = investmentSchema.parse(body);
    const base = amountInBaseCurrency(data.amount, data.currency, data.exchangeRate);
    const investment = await prisma.investment.update({ where: { id: body.id }, data: { ...data, amountInBaseCurrency: base } });
    return NextResponse.json(investment);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "更新投资失败" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.investment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "删除投资失败" }, { status: 400 });
  }
}

async function createInvestmentFromFormData(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get("paymentImage");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "每次投资都必须上传支付凭证图片" }, { status: 400 });
  }

  const payload = Object.fromEntries([...formData.entries()].filter(([key]) => key !== "paymentImage"));
  const data = investmentSchema.parse(payload);
  const attachmentUrl = await saveImageUpload(image, "investments");
  const base = amountInBaseCurrency(data.amount, data.currency, data.exchangeRate);
  const investment = await prisma.investment.create({
    data: {
      ...data,
      amountInBaseCurrency: base,
      attachmentUrl
    }
  });
  return NextResponse.json(investment);
}
