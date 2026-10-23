import { contactLabels, type ContactKey, type SiteSettings } from "@/lib/site-config";

const contactKeys = Object.keys(contactLabels) as ContactKey[];

function ContactValue({ field, value }: { field: ContactKey; value: string | null }) {
  if (!value) return <span className="pending-text">A confirmar</span>;
  if (field === "email") return <a href={`mailto:${value}`}>{value}</a>;
  if (field === "phone") return <a href={`tel:${value.replace(/\s+/g, "")}`}>{value}</a>;
  return <>{value}</>;
}

export function ContactList({ contacts, className = "" }: { contacts: SiteSettings["contacts"]; className?: string }) {
  return (
    <dl className={`contact-list ${className}`}>
      {contactKeys.map((field) => (
        <div key={field} className="contact-list__item">
          <dt>{contactLabels[field]}</dt>
          <dd>
            <ContactValue field={field} value={contacts[field]} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Contacts({ settings }: { settings: SiteSettings }) {
  const published = Object.values(settings.contacts).some(Boolean);
  return (
    <section id="contactos" className="section contacts" aria-labelledby="contacts-title">
      <div className="container contacts__inner">
        <header className="section-header contacts__header">
          <p className="eyebrow">Contactos</p>
          <h2 id="contacts-title" className="section-title">
            Fale com a AXON
          </h2>
          <p className="section-intro">
            {published
              ? "Estamos disponíveis pelos contactos oficiais abaixo."
              : "Os contactos oficiais serão publicados assim que estiverem confirmados. Até lá, esta página não recebe mensagens."}
          </p>
        </header>
        <ContactList contacts={settings.contacts} className="contacts__list" />
      </div>
    </section>
  );
}
