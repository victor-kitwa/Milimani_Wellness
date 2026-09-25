/**
 * IntaSend payment aggregator client (M-Pesa STK push + status checks).
 *
 * Docs used to build this (fetched directly from developers.intasend.com):
 * - Auth: `Authorization: Bearer <secret key>`; sandbox host
 *   https://sandbox.intasend.com, live host https://payment.intasend.com
 * - STK push: POST /api/v1/payment/mpesa-stk-push/
 *     body: { amount, phone_number, api_ref }
 * - Status: POST /api/v1/payment/status/
 *     body: { invoice_id }
 * - Webhook payload includes: invoice_id, state, provider, amount fields,
 *   api_ref, and a `challenge` field you set when registering the webhook
 *   in the IntaSend dashboard - compare it to your own secret to confirm
 *   the request actually came from IntaSend.
 *
 * Get sandbox keys at https://sandbox.intasend.com, live keys at
 * https://intasend.com. Set INTASEND_SECRET_KEY, INTASEND_PUBLISHABLE_KEY,
 * INTASEND_TEST_MODE and INTASEND_WEBHOOK_CHALLENGE in your .env.
 */

import { timingSafeEqual } from "crypto";

const SANDBOX_BASE = "https://sandbox.intasend.com";
const LIVE_BASE = "https://payment.intasend.com";

function baseUrl() {
  return process.env.INTASEND_TEST_MODE === "false" ? LIVE_BASE : SANDBOX_BASE;
}

function secretKey() {
  const key = process.env.INTASEND_SECRET_KEY;
  if (!key) {
    throw new Error(
      "INTASEND_SECRET_KEY is not set - add sandbox keys from https://sandbox.intasend.com to .env.local"
    );
  }
  return key;
}

export type IntasendInvoiceState =
  | "PENDING"
  | "PROCESSING"
  | "FAILED"
  | "CANCELED"
  | "PARTIAL"
  | "COMPLETE"
  | "RETRY";

export type StkPushResult = {
  id: string;
  invoice: {
    invoice_id: string;
    state: IntasendInvoiceState;
    account: string;
    api_ref: string | null;
    value: string;
    currency: string;
  };
};

export class IntasendError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function intasendFetch(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey()}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new IntasendError(
      `IntaSend request to ${path} failed (${res.status})`,
      res.status,
      json
    );
  }
  return json;
}

/** Triggers an M-Pesa STK push prompt on the customer's phone. */
export async function initiateMpesaStkPush(params: {
  amount: number;
  phoneNumber: string; // 2547XXXXXXXX
  apiRef: string; // our order id/number, comes back on the webhook
}): Promise<StkPushResult> {
  return intasendFetch("/api/v1/payment/mpesa-stk-push/", {
    amount: params.amount,
    phone_number: params.phoneNumber,
    api_ref: params.apiRef,
  }) as Promise<StkPushResult>;
}

/** Looks up the current state of a payment by IntaSend invoice id. */
export async function checkPaymentStatus(invoiceId: string) {
  return intasendFetch("/api/v1/payment/status/", {
    invoice_id: invoiceId,
  }) as Promise<{
    invoice: {
      invoice_id: string;
      state: IntasendInvoiceState;
      api_ref: string | null;
      value: string;
      currency: string;
      mpesa_reference?: string;
    };
  }>;
}

/**
 * Verifies an inbound webhook actually came from IntaSend. Uses a
 * constant-time comparison (Node's timingSafeEqual) rather than `===` -
 * a plain string compare returns as soon as it finds a mismatching
 * character, so how long the check takes leaks how many leading
 * characters an attacker guessed right, letting the challenge string be
 * recovered one character at a time over enough requests.
 */
export function isValidWebhookChallenge(payloadChallenge: unknown) {
  const expected = process.env.INTASEND_WEBHOOK_CHALLENGE;
  if (!expected || typeof payloadChallenge !== "string") return false; // fail closed if not configured
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(payloadChallenge);
  // timingSafeEqual throws on a length mismatch instead of returning
  // false, and comparing it against itself here would leak length via
  // timing anyway, so a differing length is rejected up front.
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(actualBuf, expectedBuf);
}

export function mapInvoiceStateToPaymentStatus(
  state: IntasendInvoiceState
): "paid" | "failed" | "unpaid" {
  if (state === "COMPLETE") return "paid";
  if (state === "FAILED" || state === "CANCELED") return "failed";
  return "unpaid";
}
