import { describe, it, expect } from 'vitest';
import { contactAddSchema } from '@validators/ContactValidator';
import { zodIssuesToFieldErrors, isFormValidationError, pickFields } from '@helpers/form/form.helper';

describe('form helper (BUG-18)', () => {
  it('maps Zod issues to visible form fields only', () => {
    const result = contactAddSchema.safeParse({ phone: 'abc-not-a-phone!', ownerId: 'x' });
    expect(result.success).toBe(false);
    if (result.success) return;
    const entries = zodIssuesToFieldErrors(result.error.issues, ['phone', 'firstName']);
    expect(entries.find((e) => e.name === 'phone')?.errors).toContain('Invalid phone format');
    expect(entries.some((e) => e.name === 'ownerId')).toBe(false);
  });

  it('detects antd validateFields rejections', () => {
    expect(isFormValidationError({ errorFields: [] })).toBe(true);
    expect(isFormValidationError(new Error('x'))).toBe(false);
  });

  it('picks only the listed fields', () => {
    expect(pickFields({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });
});
