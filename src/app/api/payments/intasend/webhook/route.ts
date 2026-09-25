import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isValidWebhookChallenge, checkPaymentStatus, IntasendError } from "@/lib/intasend";
import { reconcilePayment } from "@/lib/payment-reconcile";

/**
 * IntaSend calls this with the same shape documented at
 * developers.intasend.com/docs/payment-collection-events, e.g.
 * { invoice_id, state, api_ref, challenge, ... }.
 *
 * Register this URL (https://yourdomain/api/payments/intasend/webhook) in
 * the IntaSend dashboard along with the challenge string you put in
 * INTASEND_WEBHOOK_CHALLENGE - that's how we know a request really came
 * from IntaSend and not someone guessing the URL.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isValidWebhookChallenge(body.challenge)) {
    return NextResponse.json({ error: "Invalid challenge" }, { status: 401 });
  }

  const invoiceId: string | undefined = body.invoice_id;
  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice_id" }, { status: 400 });
  }

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.providerRef, invoiceId))
    .limit(1);

  if (!payment) {
    // Not one of ours (or already cleaned up) - acknowledge so IntaSend
    // doesn't keep retrying, but there's nothing to reconcile.
    return NextResponse.json({ ok: true, note: "No matching payment" });
  }

  // The webhook's own `state` field is just whatever the caller put in the
  // POST body - anyone who finds this URL and a real invoice id could claim
  // COMPLETE without ever paying. The challenge check above only proves the
  // request knows a shared secret, not that IntaSend actually generated
  // this specific payload, so the payment status itself is re-fetched
  // straight from IntaSend's API and that authoritative value is what gets
  // reconciled, never the value the request claimed.
  try {
    const result = await checkPaymentStatus(invoiceId);
    await reconcilePayment(payment.orderId, payment.id, result.invoice.state, result);
  } catch (err) {
    // IntaSend's status API not reachable right now - acknowledge the
    // webhook anyway (so it isn't retried indefinitely) rather than
    // reconciling on an unverified claim; the order's own confirmation
    // page actively re-checks status on load, so it'll catch up.
    if (!(err instanceof IntasendError)) {
      console.error("Webhook status re-verification failed", err);
    }
    return NextResponse.json({ ok: true, note: "Could not verify with IntaSend" });
  }

  return NextResponse.json({ ok: true });
}
