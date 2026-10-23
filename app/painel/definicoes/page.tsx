import type { Metadata } from "next";
import { CommerceForm } from "@/components/admin/CommerceForm";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { readCheckoutReadiness } from "@/lib/server/commerce";
import { requireAdmin } from "@/lib/server/session";
import { readSettings } from "@/lib/server/store";

export const metadata: Metadata = { title: "Definições" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = readSettings();
  const readiness = readCheckoutReadiness();

  return (
    <>
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Loja</p>
          <h1 className="admin-page__title">Definições</h1>
          <p className="admin-page__lead">
            Loja online, contactos, identificação da empresa e páginas legais. Campos vazios aparecem no site como «A
            confirmar» ou «Pendente».
          </p>
        </div>
      </header>

      <section className="admin-card" aria-labelledby="loja-online-title">
        <h2 id="loja-online-title" className="admin-card__title">
          Loja online
        </h2>
        <CommerceForm
          settings={readiness.settings}
          missing={readiness.missing}
          providerLabel={readiness.providerLabel}
          testMode={readiness.testMode}
          methods={readiness.methods}
        />
      </section>

      <section className="admin-card" aria-labelledby="dados-loja-title">
        <h2 id="dados-loja-title" className="admin-card__title">
          Contactos, empresa e páginas legais
        </h2>
        <SettingsForm settings={settings} />
      </section>
    </>
  );
}
