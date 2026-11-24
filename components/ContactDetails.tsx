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
