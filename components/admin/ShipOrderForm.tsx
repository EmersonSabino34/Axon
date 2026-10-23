"use client";

import { useActionState } from "react";
import { shipOrder } from "@/app/painel/actions";
import { FormMessage, SubmitButton, TextField } from "../forms/Fields";

export function ShipOrderForm({ number }: { number: string }) {
  const [state, action] = useActionState(shipOrder.bind(null, number), undefined);
  return (
    <form action={action} className="form-stack">
      <TextField
        label="Nota para o cliente (opcional)"
        name="note"
        placeholder="Ex.: transportadora e número de seguimento"
        maxLength={300}
        hint="Aparece na página da encomenda do cliente."
      />
      <FormMessage state={state} />
      <div>
        <SubmitButton>Marcar como enviada</SubmitButton>
      </div>
    </form>
  );
}
