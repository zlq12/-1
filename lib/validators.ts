import { z } from "zod";

export const moneySchema = z.coerce.number().nonnegative();

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().positive().optional()
);

const optionalText = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.string().optional()
);

export const investmentSchema = z.object({
  partnerName: z.string().min(1, "请选择合伙人"),
  type: z.enum(["initial_investment", "additional_investment"], {
    errorMap: () => ({ message: "投资类型只能选择初始投资或回款投入" })
  }),
  amount: moneySchema,
  currency: z.enum(["CNY", "USD"]),
  exchangeRate: optionalPositiveNumber.nullable(),
  date: z.coerce.date(),
  purpose: optionalText,
  note: optionalText
});

export const expenseSchema = z.object({
  date: z.coerce.date(),
  category: z.enum(["product_purchase", "first_leg_shipping", "amazon_fee", "fba_fee", "storage_fee", "advertising", "software", "sample", "packaging", "photography", "inspection", "customs", "refund_loss", "partner_repayment", "dividend", "other"]),
  subCategory: optionalText,
  amount: moneySchema,
  currency: z.enum(["CNY", "USD"]),
  exchangeRate: optionalPositiveNumber.nullable(),
  paymentAccount: optionalText,
  payer: z.string().min(1, "请填写支出人姓名"),
  relatedPartner: optionalText,
  relatedStore: optionalText,
  relatedMarketplace: optionalText,
  relatedSku: optionalText,
  relatedAsin: optionalText,
  relatedBatchNo: optionalText,
  supplier: optionalText,
  description: z.string().min(1, "请填写支出说明"),
  note: optionalText
});

export function amountInBaseCurrency(amount: number, currency: "CNY" | "USD", exchangeRate?: number | null) {
  if (currency === "CNY") return amount;
  return amount * (exchangeRate || 7.2);
}
