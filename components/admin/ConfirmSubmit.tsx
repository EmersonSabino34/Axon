"use client";

import type { ReactNode } from "react";

// Botão de envio que pede confirmação antes de uma ação que não pode ser anulada.
export function ConfirmSubmit({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
