export const investmentTypeLabels: Record<string, string> = {
  initial_investment: "初始投资",
  additional_investment: "回款投入",
  advance_payment: "合伙人垫付",
  loan: "借款",
  repayment: "还款",
  dividend: "分红",
  withdrawal: "提现"
};

export const activeInvestmentTypes = ["initial_investment", "additional_investment"] as const;

export const expenseCategoryLabels: Record<string, string> = {
  product_purchase: "产品采购",
  first_leg_shipping: "头程物流",
  amazon_fee: "亚马逊平台费",
  fba_fee: "FBA 配送费",
  storage_fee: "仓储费",
  advertising: "广告费",
  software: "软件订阅",
  sample: "样品费",
  packaging: "包装费",
  photography: "拍摄设计",
  inspection: "质检费",
  customs: "关税清关",
  refund_loss: "退款损失",
  partner_repayment: "合伙人还款",
  dividend: "合伙人分红",
  other: "其他"
};

export const importSourceLabels: Record<string, string> = {
  amazon_seller_central: "亚马逊后台",
  amazon_advertising: "亚马逊广告",
  lingxing_erp: "领星 ERP",
  manual_template: "手工模板",
  unknown: "未知来源"
};
