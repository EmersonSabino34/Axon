// Estado devolvido pelas ações de servidor aos formulários (useActionState).
export type FormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Partial<Record<string, string>>;
    }
  | undefined;

export const PASSWORD_MIN_LENGTH = 8;

export function validateName(value: string): string | null {
  const name = value.trim();
  if (name.length < 2) return "Indique o seu nome.";
  if (name.length > 80) return "O nome pode ter no máximo 80 caracteres.";
  return null;
}

export function validateNewPassword(password: string, confirmation: string): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `A palavra-passe tem de ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  } else if (password.length > 128) {
    errors.password = "A palavra-passe pode ter no máximo 128 caracteres.";
  } else if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) {
    errors.password = "Use pelo menos uma letra e um número.";
  }
  if (password !== confirmation) errors.confirmation = "As palavras-passe não coincidem.";
  return errors;
}

export const hasErrors = (errors: Partial<Record<string, string>>) => Object.values(errors).some(Boolean);
