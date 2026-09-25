"use client";

import { useEffect, useState } from "react";
import { getOrderPaymentStatus } from "@/server/order-status-actions";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export function PaymentStatusPoller({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: "unpaid" | "paid" | "failed" | "refunded";
}) {
  const [status, setStatus] = useState(initialStatus);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status !== "unpaid") return;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const result = await getOrderPaymentStatus(orderId);
        if (!cancelled && result) {
          setStatus(result.paymentStatus);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
      if (!cancelled && attempts < 30) {
        setTimeout(poll, 4000);
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, status]);

  if (status === "paid") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">Payment received</p>
          <p className="text-sm">Thanks! We're getting your order ready.</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        <XCircle className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">Payment did not go through</p>
          <p className="text-sm">
            The M-Pesa prompt wasn't completed. Contact us on WhatsApp and we'll help you pay another way.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
      <Loader2 className="h-6 w-6 shrink-0 animate-spin" />
      <div>
        <p className="font-semibold">Check your phone</p>
        <p className="text-sm">
          {checking
            ? "Enter your M-Pesa PIN when the prompt arrives to complete payment."
            : "Still waiting for confirmation..."}
        </p>
      </div>
    </div>
  );
}
