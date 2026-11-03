export function getPasswordPolicyError(password: string): string | null {
  if (password.length < 8 || password.length > 128) {
    return "Use at least 8 characters and no more than 128 characters.";
  }
  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return "Include an uppercase letter, a lowercase letter, a number, and a symbol.";
  }
  return null;
}
