import type { FormInstance } from 'antd';
import type { ZodIssue } from 'zod';

export interface FieldErrorEntry {
  name: string;
  errors: string[];
}

/**
 * Groups Zod issues by top-level field, keeping only fields rendered in the form.
 */
export function zodIssuesToFieldErrors(issues: ZodIssue[], formFields: readonly string[]): FieldErrorEntry[] {
  const byField = new Map<string, string[]>();
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== 'string' || !formFields.includes(field)) continue;
    const list = byField.get(field) ?? [];
    list.push(issue.message);
    byField.set(field, list);
  }
  return [...byField.entries()].map(([name, errors]) => ({ name, errors }));
}

/**
 * Shows Zod issues under the matching form fields. Returns false when none of
 * the issues maps to a visible field (caller should show a generic message).
 */
export function applyZodErrorsToForm(
  form: FormInstance,
  issues: ZodIssue[],
  formFields: readonly string[],
): boolean {
  const entries = zodIssuesToFieldErrors(issues, formFields);
  if (entries.length > 0) form.setFields(entries);
  return entries.length > 0;
}

/** antd's validateFields() rejects with `{ errorFields }` on rule failures. */
export function isFormValidationError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'errorFields' in error;
}

/** Keeps only the keys present in `fields`. */
export function pickFields<T extends Record<string, unknown>>(values: T, fields: readonly string[]): Partial<T> {
  const result: Partial<T> = {};
  for (const key of fields) {
    if (key in values) (result as Record<string, unknown>)[key] = values[key];
  }
  return result;
}
