import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { passwordProblem } from '@/lib/password';
describe('admin access rules', () => {
  it('rejects passwords shorter than 12 characters', () => expect(passwordProblem('Corta1234!')).not.toBeNull());
  it('rejects easy passwords', () => { for (const p of ['password1234', '123456789012', 'aaaaaaaaaaaa', 'safari2024!!', 'Watamu123456']) expect(passwordProblem(p)).not.toBeNull(); });
  it('rejects the email name inside the password', () => expect(passwordProblem('mario.rossi-casa-blu', 'mario.rossi@example.com')).not.toBeNull());
  it('accepts a long passphrase', () => expect(passwordProblem('baobab tramonto granchio luna')).toBeNull());
  it('has no public password recovery page or link', () => {
    expect(existsSync('src/routes/reset-password.tsx')).toBe(false);
    expect(readFileSync('src/routes/admin.tsx', 'utf8')).not.toMatch(/resetPasswordForEmail|Password dimenticata\?/);
  });
  it('guide has no secrets', () => expect(readFileSync('docs/GUIDA-TITOLARE.md', 'utf8')).not.toMatch(/sb_publishable|service_role|eyJ[a-zA-Z0-9]/));
});
