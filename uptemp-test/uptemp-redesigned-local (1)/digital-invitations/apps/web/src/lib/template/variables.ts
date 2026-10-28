/**
 * Dynamic variable resolution for the template engine.
 *
 * Supports the `{{variable_name}}` syntax used both by template configuration
 * (headings, messages) and by customer supplied content, e.g.
 * "Dear {{guest_name}}".
 */

export type VariableBag = Record<string, string | number | null | undefined>;

const TOKEN_PATTERN = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;

export function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_match, chr: string) => chr.toUpperCase());
}

export function toTitleCase(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (chr) => chr.toUpperCase());
}

/**
 * Replaces every `{{token}}` in the input with its value from the bag.
 * Unknown tokens resolve to an empty string so a missing optional field never
 * leaks raw markup into the invitation.
 */
export function interpolate(input: unknown, variables: VariableBag): string {
  if (input === null || input === undefined) return '';
  const source = typeof input === 'string' ? input : String(input);
  if (!source.includes('{{')) return source;

  const replaced = source.replace(TOKEN_PATTERN, (_match, token: string) => {
    const value = variables[token];
    if (value === null || value === undefined) return '';
    return String(value);
  });

  // Collapse runs of spaces left behind by empty optional values, but keep
  // paragraph breaks intact.
  return replaced.replace(/[^\S\r\n]{2,}/g, ' ').trim();
}

/**
 * Returns true when every placeholder in the input resolved to something.
 * Used to decide whether an optional section should be rendered at all.
 */
export function hasResolvedValue(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Flattens a free-form content object (snake_case keys coming from the API)
 * into both snake_case and camelCase entries so templates can use either
 * `{{bride_name}}` or `{{brideName}}`.
 */
export function flattenContent(content: Record<string, unknown>): VariableBag {
  const bag: VariableBag = {};

  for (const [rawKey, rawValue] of Object.entries(content || {})) {
    if (rawValue === null || rawValue === undefined) continue;
    const value = typeof rawValue === 'object' ? JSON.stringify(rawValue) : rawValue;
    bag[rawKey] = value as string | number;
    bag[snakeToCamel(rawKey)] = value as string | number;
  }

  return bag;
}
