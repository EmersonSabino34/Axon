"use client";

import { useEffect } from "react";

function track(type: "view" | "whatsapp", productId: string) {
  const body = JSON.stringify({ type, productId });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  else fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
}

// Regista uma visualização do produto (alimenta o dashboard).
export function TrackView({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `axon-view-${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    track("view", productId);
  }, [productId]);
  return null;
}

export function BuyButton({ productId, href }: { productId: string; href: string }) {
  return (
    <a className="btn dark" href={href} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp", productId)}>
      Comprar pelo WhatsApp
    </a>
  );
}
