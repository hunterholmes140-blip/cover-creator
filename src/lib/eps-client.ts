// ============================================================
// EPS (Easy Payment System) Merchant API Client Library
// Official API Spec Version 0.5 (January 2024)
// ============================================================

export type EpsConfig = {
  enabled: boolean | number;
  is_sandbox: boolean | number;
  username: string;
  password: string;
  merchant_id: string;
  store_id: string;
  hash_key: string;
};

export const DEFAULT_EPS_CONFIG: EpsConfig = {
  enabled: 1,
  is_sandbox: 1,
  username: "",
  password: "",
  merchant_id: "",
  store_id: "",
  hash_key: "",
};

const EPS_STORAGE_KEY = "ns.eps_config.v1";

export function getEpsConfig(): EpsConfig {
  if (typeof window === "undefined") return DEFAULT_EPS_CONFIG;
  try {
    const raw = localStorage.getItem(EPS_STORAGE_KEY);
    return raw ? { ...DEFAULT_EPS_CONFIG, ...JSON.parse(raw) } : DEFAULT_EPS_CONFIG;
  } catch {
    return DEFAULT_EPS_CONFIG;
  }
}

export function saveEpsConfig(cfg: Partial<EpsConfig>): EpsConfig {
  const current = getEpsConfig();
  const next = { ...current, ...cfg };
  if (typeof window !== "undefined") {
    localStorage.setItem(EPS_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

// ------------------------------------------------------------
// HMAC-SHA512 Base64 Hash Generator (Web Crypto API)
// ------------------------------------------------------------
export async function generateEpsHash(hashKey: string, keyToHash: string): Promise<string> {
  if (!hashKey || !keyToHash) return "";
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(hashKey);
    const textData = encoder.encode(keyToHash);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, textData);
    const bytes = new Uint8Array(signature);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.error("HMAC SHA512 error:", err);
    return "";
  }
}

// ------------------------------------------------------------
// API Endpoint Base URL
// ------------------------------------------------------------
export function getEpsApiBaseUrl(isSandbox = true): string {
  return "https://pgapi.eps.com.bd";
}

// ------------------------------------------------------------
// API No. 01: GetToken (/v1/Auth/GetToken)
// ------------------------------------------------------------
export async function epsGetToken(config: EpsConfig): Promise<{ token: string; expireDate?: string }> {
  if (!config.username || !config.password || !config.hash_key) {
    throw new Error("EPS Username, Password এবং Hash Key সেট করা নেই।");
  }

  const hash = await generateEpsHash(config.hash_key, config.username);
  const baseUrl = getEpsApiBaseUrl(!!config.is_sandbox);

  const res = await fetch(`${baseUrl}/v1/Auth/GetToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hash": hash,
    },
    body: JSON.stringify({
      userName: config.username,
      password: config.password,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.token) {
    throw new Error(json.errorMessage || json.message || "EPS টোকেন সংগ্রহ করা যায়নি।");
  }

  return { token: json.token, expireDate: json.expireDate };
}

// ------------------------------------------------------------
// API No. 02: Initialize Payment (/v1/EPSEngine/InitializeEPS)
// ------------------------------------------------------------
export type EpsInitPaymentInput = {
  customerOrderId: string;
  merchantTransactionId: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
};

export async function epsInitializePayment(
  config: EpsConfig,
  input: EpsInitPaymentInput
): Promise<{ redirectUrl: string; transactionId: string }> {
  if (!config.merchant_id || !config.store_id || !config.hash_key) {
    throw new Error("EPS Merchant ID, Store ID এবং Hash Key সেট করা নেই।");
  }

  // Step 1: Get Token
  const { token } = await epsGetToken(config);

  // Step 2: Generate Hash for merchantTransactionId
  const hash = await generateEpsHash(config.hash_key, input.merchantTransactionId);
  const baseUrl = getEpsApiBaseUrl(!!config.is_sandbox);

  const bodyPayload = {
    storeId: config.store_id,
    merchantId: config.merchant_id,
    CustomerOrderId: input.customerOrderId,
    merchantTransactionId: input.merchantTransactionId,
    transactionTypeId: 1, // 1 = Web
    financialEntityId: 0,
    transitionStatusId: 0,
    totalAmount: input.totalAmount,
    ipAddress: "103.12.45.69",
    version: "1",
    successUrl: input.successUrl,
    failUrl: input.failUrl,
    cancelUrl: input.cancelUrl,
    customerName: input.customerName || "Student",
    customerEmail: input.customerEmail || "student@nextscale.com",
    CustomerAddress: "Dhaka, Bangladesh",
    CustomerAddress2: "Dhaka",
    CustomerCity: "Dhaka",
    CustomerState: "Dhaka",
    CustomerPostcode: "1200",
    CustomerCountry: "BD",
    CustomerPhone: input.customerPhone || "01700000000",
    ShipmentName: "Digital Course",
    ShipmentAddress: "Online",
    ShipmentCity: "Dhaka",
    ShipmentState: "Dhaka",
    ShipmentPostcode: "1200",
    ShipmentCountry: "BD",
    ValueA: "",
    ValueB: "",
    ValueC: "",
    ValueD: "",
    ShippingMethod: "NO",
    NoOfItem: "1",
    ProductName: input.productName,
    ProductProfile: "general",
    ProductCategory: "Education",
  };

  const res = await fetch(`${baseUrl}/v1/EPSEngine/InitializeEPS`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hash": hash,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bodyPayload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || (!json.RedirectURL && !json.redirectURL)) {
    throw new Error(json.ErrorMessage || json.errorMessage || "EPS পেমেন্ট গেটওয়ে সেসন শুরু করা যায়নি।");
  }

  return {
    redirectUrl: json.RedirectURL || json.redirectURL,
    transactionId: json.TransactionId || json.transactionId || input.merchantTransactionId,
  };
}

// ------------------------------------------------------------
// API No. 03: Verify Transaction Status
// ------------------------------------------------------------
export async function epsVerifyTransaction(
  config: EpsConfig,
  merchantTransactionId: string
): Promise<{ status: string; amount?: number; epsTxId?: string }> {
  const { token } = await epsGetToken(config);
  const hash = await generateEpsHash(config.hash_key, merchantTransactionId);
  const baseUrl = getEpsApiBaseUrl(!!config.is_sandbox);

  const res = await fetch(
    `${baseUrl}/v1/EPSEngine/CheckMerchantTransactionStatus?merchantTransactionId=${encodeURIComponent(merchantTransactionId)}`,
    {
      method: "GET",
      headers: {
        "x-hash": hash,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await res.json().catch(() => ({}));
  return {
    status: json.Status || json.status || "Unknown",
    amount: json.TotalAmount ? Number(json.TotalAmount) : undefined,
    epsTxId: json.EpsTransactionId || json.epsTransactionId,
  };
}
