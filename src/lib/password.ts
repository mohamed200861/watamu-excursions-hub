/** Minimum password length for every admin password (login upgrade, change, reset, second admin). */
export const MIN_PASSWORD = 12;
export const passwordTooShort = (p: string) => p.length < MIN_PASSWORD;
