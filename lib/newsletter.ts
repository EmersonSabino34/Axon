import { siteConfig } from "./site-config";

export type NewsletterRequest = {
  email: string;
  consent: true;
};

export type NewsletterResult = { status: "demo" } | { status: "subscribed" } | { status: "error" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Indique o seu endereço de e-mail.";
  if (!EMAIL_PATTERN.test(email)) return "Verifique o endereço de e-mail (por exemplo, nome@dominio.pt).";
  return null;
}

// Ponto de integração da newsletter. Sem `siteConfig.newsletter.endpoint` nada sai do navegador.
// Quando houver serviço, crie um Route Handler nesse endereço que guarde o pedido com prova de
// consentimento e que mantenha as chaves do serviço no servidor (nunca no código do navegador).
export async function subscribeToNewsletter(request: NewsletterRequest): Promise<NewsletterResult> {
  const { endpoint } = siteConfig.newsletter;
  if (!endpoint) return { status: "demo" };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return response.ok ? { status: "subscribed" } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
