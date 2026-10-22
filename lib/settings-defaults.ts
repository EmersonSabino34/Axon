export type Settings = {
  whatsapp: string;        // somente dígitos, com DDI e DDD (ex.: 5511999999999)
  whatsappDisplay: string; // como aparece no site
  email: string;
  instagram: string;
  hours: string;
};

export const defaultSettings: Settings = {
  whatsapp: "5500000000000",
  whatsappDisplay: "(00) 00000-0000",
  email: "contato@axon.com.br",
  instagram: "@axon.suplementos",
  hours: "Segunda a sexta, das 9h às 18h",
};

export const settingFields: { key: keyof Settings; label: string; hint?: string }[] = [
  { key: "whatsapp", label: "Número do WhatsApp (para os links)", hint: "Somente dígitos, com 55 e o DDD. Ex.: 5511999999999" },
  { key: "whatsappDisplay", label: "WhatsApp como aparece no site", hint: "Ex.: (11) 99999-9999" },
  { key: "email", label: "E-mail de contato" },
  { key: "instagram", label: "Instagram" },
  { key: "hours", label: "Horário de atendimento" },
];
