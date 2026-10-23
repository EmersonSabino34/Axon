"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { hasErrors, validateName, validateNewPassword, type FormState } from "@/lib/forms";
import { validateEmail } from "@/lib/newsletter";
import { getDummyHash, hashPassword, verifyPassword } from "@/lib/server/passwords";
import { clearLoginFailures, loginLockMinutes, recordLoginFailure } from "@/lib/server/rate-limit";
import { createSession, destroySession, requireUser } from "@/lib/server/session";
import {
  createUser,
  deleteUser,
  EmailTakenError,
  getCredentialsByEmail,
  getPasswordHash,
  touchLastLogin,
  updatePasswordHash,
  updateUserName,
} from "@/lib/server/users";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");

  const fieldErrors = {
    email: validateEmail(email) ?? undefined,
    password: password ? undefined : "Indique a palavra-passe.",
  };
  if (hasErrors(fieldErrors)) return { fieldErrors };

  const lockMinutes = loginLockMinutes(email);
  if (lockMinutes > 0) {
    return { error: `Demasiadas tentativas falhadas. Tente novamente dentro de ${lockMinutes} min.` };
  }

  const user = getCredentialsByEmail(email);
  const valid = await verifyPassword(password, user?.passwordHash ?? getDummyHash());
  if (!user || !valid) {
    recordLoginFailure(email);
    return { error: "E-mail ou palavra-passe incorretos." };
  }

  clearLoginFailures(email);
  touchLastLogin(user.id);
  await createSession(user.id);
  redirect(user.role === "admin" ? "/painel" : "/conta");
}

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name").trim();
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");

  const fieldErrors: Partial<Record<string, string>> = {
    name: validateName(name) ?? undefined,
    email: validateEmail(email) ?? undefined,
    ...validateNewPassword(password, text(formData, "confirmation")),
    terms: formData.get("terms") === "on" ? undefined : "Para criar conta, aceite os Termos e a Política de Privacidade.",
  };
  if (hasErrors(fieldErrors)) return { fieldErrors };

  let userId: number;
  try {
    userId = createUser({ name, email, passwordHash: await hashPassword(password) }).id;
  } catch (error) {
    if (error instanceof EmailTakenError) {
      return { fieldErrors: { email: "Já existe uma conta com este e-mail. Experimente iniciar sessão." } };
    }
    throw error;
  }

  touchLastLogin(userId);
  await createSession(userId);
  redirect("/conta");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function updateName(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = text(formData, "name").trim();
  const error = validateName(name);
  if (error) return { fieldErrors: { name: error } };
  updateUserName(user.id, name);
  refresh();
  return { success: "Nome atualizado." };
}

export async function changePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = text(formData, "current");
  const password = text(formData, "password");

  const stored = getPasswordHash(user.id);
  if (!stored || !(await verifyPassword(current, stored))) {
    return { fieldErrors: { current: "A palavra-passe atual não está correta." } };
  }
  const fieldErrors = validateNewPassword(password, text(formData, "confirmation"));
  if (hasErrors(fieldErrors)) return { fieldErrors };

  updatePasswordHash(user.id, await hashPassword(password));
  return { success: "Palavra-passe alterada." };
}

export async function deleteAccount(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (user.role === "admin") {
    return { error: "As contas de administrador não podem ser eliminadas por aqui." };
  }
  if (formData.get("confirm") !== "on") {
    return { fieldErrors: { confirm: "Confirme que quer eliminar a conta." } };
  }
  const stored = getPasswordHash(user.id);
  if (!stored || !(await verifyPassword(text(formData, "password"), stored))) {
    return { fieldErrors: { password: "A palavra-passe não está correta." } };
  }

  await destroySession();
  deleteUser(user.id);
  redirect("/");
}
