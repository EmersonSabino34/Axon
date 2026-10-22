import { addAdmin, changePassword, saveSettings } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { db } from "@/lib/db";
import { dateBR } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { settingFields } from "@/lib/settings-defaults";

export const metadata = { title: "Configurações" };

export default async function Configuracoes() {
  const [settings, admins] = await Promise.all([getSettings(), db.adminUser.findMany({ orderBy: { createdAt: "asc" } })]);
  return (
    <>
      <div className="adm-head">
        <div><h1>Configurações</h1><p>Contatos exibidos no site e acessos ao painel.</p></div>
      </div>
      <div className="cols">
        <section className="panel c8">
          <h2>Contatos do site</h2>
          <ActionForm action={saveSettings} submit="Salvar contatos">
            {settingFields.map((f) => (
              <label key={f.key} className={f.key === "hours" ? "full" : undefined}>
                {f.label}
                {f.hint && <small>{f.hint}</small>}
                <input id={`s-${f.key}`} name={f.key} defaultValue={settings[f.key]} />
              </label>
            ))}
          </ActionForm>
        </section>
        <section className="panel c4">
          <h2>Alterar a minha senha</h2>
          <ActionForm action={changePassword} submit="Alterar senha">
            <label className="full">Senha atual<input id="pw-current" name="current" type="password" autoComplete="current-password" required /></label>
            <label className="full">Nova senha<small>Mínimo 8 caracteres</small><input id="pw-next" name="next" type="password" autoComplete="new-password" required /></label>
          </ActionForm>
        </section>
        <section className="panel c12">
          <h2>Administradores</h2>
          <div className="table-wrap" style={{ marginBottom: 20 }}>
            <table className="t">
              <thead><tr><th>Nome</th><th>E-mail</th><th>Desde</th></tr></thead>
              <tbody>{admins.map((a) => <tr key={a.id}><td>{a.name}</td><td>{a.email}</td><td>{dateBR(a.createdAt)}</td></tr>)}</tbody>
            </table>
          </div>
          <ActionForm action={addAdmin} submit="Criar acesso">
            <label>Nome<input id="a-name" name="name" /></label>
            <label>E-mail<input id="a-email" name="email" type="email" required /></label>
            <label>Senha inicial<small>Mínimo 8 caracteres</small><input id="a-pass" name="password" type="password" autoComplete="new-password" required /></label>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
