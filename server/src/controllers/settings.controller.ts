import { Request, Response } from "express";
import SiteOptions from "@/utils/site-options";

// D1 — GET /api/admin/settings
export async function getSettings(req: Request, res: Response) {
  const [hostUrl, siteMode, notice, maintenanceText] = await Promise.all([
    SiteOptions.hostUrl.get(),
    SiteOptions.siteMode.get(),
    SiteOptions.notice.get(),
    SiteOptions.maintenanceText.get(),
  ]);
  res.json({ success: true, data: { hostUrl, siteMode, notice, maintenanceText } });
}

// D1 — PUT /api/admin/settings
export async function updateSettings(req: Request, res: Response) {
  const { hostUrl, siteMode, notice, maintenanceText } = req.body;
  await Promise.all([
    hostUrl !== undefined && SiteOptions.hostUrl.set(hostUrl),
    siteMode !== undefined && SiteOptions.siteMode.set(siteMode),
    notice !== undefined && SiteOptions.notice.set(notice),
    maintenanceText !== undefined && SiteOptions.maintenanceText.set(maintenanceText),
  ]);
  res.json({ success: true, message: "Settings updated" });
}

// D2 — GET /api/admin/payment-api
export async function getPaymentApi(req: Request, res: Response) {
  const [nowPaymentsKey, nowPaymentsSecret, shkeeperKey, currentMethod] = await Promise.all([
    SiteOptions.payment.nowPayments.apiKey.get(),
    SiteOptions.payment.nowPayments.callbackSecret.get(),
    SiteOptions.payment.shkeeper.apiKey.get(),
    SiteOptions.payment.currentMethod.get(),
  ]);
  res.json({ success: true, data: { nowPayments: { apiKey: nowPaymentsKey, callbackSecret: nowPaymentsSecret }, shkeeper: { apiKey: shkeeperKey }, currentMethod } });
}

// D2 — PUT /api/admin/payment-api
export async function updatePaymentApi(req: Request, res: Response) {
  const { nowPayments, shkeeper, currentMethod } = req.body;
  await Promise.all([
    nowPayments?.apiKey !== undefined && SiteOptions.payment.nowPayments.apiKey.set(nowPayments.apiKey),
    nowPayments?.callbackSecret !== undefined && SiteOptions.payment.nowPayments.callbackSecret.set(nowPayments.callbackSecret),
    shkeeper?.apiKey !== undefined && SiteOptions.payment.shkeeper.apiKey.set(shkeeper.apiKey),
    currentMethod !== undefined && SiteOptions.payment.currentMethod.set(currentMethod),
  ]);
  res.json({ success: true, message: "Payment API config updated" });
}

// D3 — GET /api/admin/products-api
export async function getProductsApi(req: Request, res: Response) {
  const [apiUser, apiKey, socks5ApiKey] = await Promise.all([
    SiteOptions.apiUser.get(),
    SiteOptions.apiKey.get(),
    SiteOptions.socks5ProxyAPIKey.get(),
  ]);
  res.json({ success: true, data: { numbersApi: { user: apiUser, key: apiKey }, socks5Api: { apiKey: socks5ApiKey } } });
}

// D3 — PUT /api/admin/products-api
export async function updateProductsApi(req: Request, res: Response) {
  const { numbersApi, socks5Api } = req.body;
  await Promise.all([
    numbersApi?.user !== undefined && SiteOptions.apiUser.set(numbersApi.user),
    numbersApi?.key !== undefined && SiteOptions.apiKey.set(numbersApi.key),
    socks5Api?.apiKey !== undefined && SiteOptions.socks5ProxyAPIKey.set(socks5Api.apiKey),
  ]);
  res.json({ success: true, message: "Products API config updated" });
}

// D4 — GET /api/admin/pricing
export async function getPricing(req: Request, res: Response) {
  const tc = SiteOptions.transactionCut;
  const [otr, ltShort, ltRegular, ltUnlimited, proxySharedDay, socks5] = await Promise.all([
    tc.OneTime.get(), tc.LongTerm.short.get(), tc.LongTerm.regular.get(),
    tc.LongTerm.unlimited.get(), tc.Proxy.shared.day.get(), tc.Socks5Proxy.get(),
  ]);
  res.json({ success: true, data: { oneTime: otr, longTerm: { short: ltShort, regular: ltRegular, unlimited: ltUnlimited }, proxyShared: { day: proxySharedDay }, socks5Proxy: socks5 } });
}

// D4 — PUT /api/admin/pricing
export async function updatePricing(req: Request, res: Response) {
  const { oneTime, longTerm, socks5Proxy } = req.body;
  await Promise.all([
    oneTime !== undefined && SiteOptions.transactionCut.OneTime.set(oneTime),
    longTerm?.short !== undefined && SiteOptions.transactionCut.LongTerm.short.set(longTerm.short),
    longTerm?.regular !== undefined && SiteOptions.transactionCut.LongTerm.regular.set(longTerm.regular),
    longTerm?.unlimited !== undefined && SiteOptions.transactionCut.LongTerm.unlimited.set(longTerm.unlimited),
    socks5Proxy !== undefined && SiteOptions.transactionCut.Socks5Proxy.set(socks5Proxy),
  ]);
  res.json({ success: true, message: "Pricing updated" });
}