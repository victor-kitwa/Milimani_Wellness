"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type ToastableState = { success?: boolean; error?: string } | undefined;

/* Fires the "Saved" toast used across every admin save/update form.
   <Toaster richColors /> is already mounted in the root layout, so
   toast.success() already renders with its own green background and
   check icon - this just triggers it once per action result.

   Depends on the whole `state` object (not state.success) because
   useActionState hands back a brand-new object every dispatch, even when
   two saves in a row both resolve to { success: true } - a primitive
   boolean dependency wouldn't re-fire the second time since true === true. */
export function useSaveToast(state: ToastableState, message = "Saved") {
  useEffect(() => {
    if (state?.success) toast.success(message);
  }, [state, message]);
}
