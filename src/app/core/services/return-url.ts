// Router.navigateByUrl ne reçoit qu'une URL interne, jamais une destination externe.
export function safeReturnUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\s]/.test(value)) return '/';
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith('//') || decoded.includes('\\') || /^\/auth(?:[/?#;]|$)/.test(decoded)) return '/';
  } catch {
    return '/';
  }
  return value;
}
