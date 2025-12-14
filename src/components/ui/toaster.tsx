// src/components/ui/toaster.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type ToastVariant = "default" | "success" | "error";

export type ToastInput = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = Required<Pick<ToastInput, "variant" | "durationMs">> &
  ToastInput & {
    id: string;
    createdAt: number;
  };

type ToastEvent =
  | { type: "ADD"; toast: ToastItem }
  | { type: "DISMISS"; id: string }
  | { type: "CLEAR" };

type Listener = (ev: ToastEvent) => void;

const listeners = new Set<Listener>();

function emit(ev: ToastEvent) {
  for (const l of listeners) l(ev);
}

function uid(prefix = "t") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/**
 * Minimaler Toaster, damit dein Build nicht an einem fehlenden shadcn-File stirbt.
 * Optional nutzbar via toast({ title, description, variant }).
 */
export function toast(input: ToastInput): { id: string; dismiss: () => void } {
  const id = uid("toast");
  const item: ToastItem = {
    id,
    createdAt: Date.now(),
    title: input.title,
    description: input.description,
    variant: input.variant ?? "default",
    durationMs: Math.max(800, input.durationMs ?? 2500)
  };

  emit({ type: "ADD", toast: item });

  return {
    id,
    dismiss: () => emit({ type: "DISMISS", id })
  };
}

export function dismissToast(id: string) {
  emit({ type: "DISMISS", id });
}

export function clearToasts() {
  emit({ type: "CLEAR" });
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const borderColorFor = useMemo(() => {
    return (v: ToastVariant) => {
      if (v === "success") return "border-green-500/40";
      if (v === "error") return "border-red-500/40";
      return "border-black/15";
    };
  }, []);

  const badgeFor = useMemo(() => {
    return (v: ToastVariant) => {
      if (v === "success") return "OK";
      if (v === "error") return "ERR";
      return "INFO";
    };
  }, []);

  useEffect(() => {
    const onEvent: Listener = (ev) => {
      if (ev.type === "ADD") {
        setItems((prev) => {
          const next = [ev.toast, ...prev].slice(0, 6);
          return next;
        });

        // Auto-dismiss Timer
        const handle = window.setTimeout(() => {
          emit({ type: "DISMISS", id: ev.toast.id });
        }, ev.toast.durationMs);

        timersRef.current.set(ev.toast.id, handle);
      }

      if (ev.type === "DISMISS") {
        const handle = timersRef.current.get(ev.id);
        if (handle) {
          window.clearTimeout(handle);
          timersRef.current.delete(ev.id);
        }
        setItems((prev) => prev.filter((t) => t.id !== ev.id));
      }

      if (ev.type === "CLEAR") {
        for (const handle of timersRef.current.values()) window.clearTimeout(handle);
        timersRef.current.clear();
        setItems([]);
      }
    };

    listeners.add(onEvent);
    return () => {
      listeners.delete(onEvent);
      for (const handle of timersRef.current.values()) window.clearTimeout(handle);
      timersRef.current.clear();
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto rounded-2xl border bg-white/85 px-3 py-2 shadow-sm backdrop-blur",
            borderColorFor(t.variant)
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 select-none rounded-lg border border-black/10 bg-black/5 px-2 py-1 text-[10px] font-semibold">
              {badgeFor(t.variant)}
            </div>

            <div className="min-w-0 flex-1">
              {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
              {t.description ? (
                <div className="mt-0.5 text-xs text-black/65">{t.description}</div>
              ) : null}
            </div>

            <button
              type="button"
              className="rounded-lg border border-black/10 px-2 py-1 text-xs hover:bg-black/5"
              onClick={() => dismissToast(t.id)}
              aria-label="Toast schließen"
              title="Schließen"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
