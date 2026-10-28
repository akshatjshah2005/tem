import * as fs from 'fs';
import * as path from 'path';

export interface TemplateDefinitionFile {
  schemaVersion?: number;
  name: string;
  slug: string;
  description?: string;
  version?: string;
  isPremium?: boolean;
  features?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  editableFields?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

const TEMPLATES_DIR = path.resolve(__dirname, '..', '..', '..', 'templates');

/**
 * Loads every template definition JSON from the repository `templates/` folder.
 * The folder is the source of truth for template design configuration; the
 * database stores a copy so the API can serve it without touching the disk.
 */
export function loadTemplateDefinitions(): TemplateDefinitionFile[] {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }

  const definitions: TemplateDefinitionFile[] = [];

  for (const entry of fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(TEMPLATES_DIR, entry.name, 'config.json');
    if (!fs.existsSync(file)) continue;

    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw) as TemplateDefinitionFile;

    if (!parsed.slug) {
      throw new Error(`Template definition ${file} is missing "slug"`);
    }

    definitions.push(parsed);
  }

  return definitions;
}

export function getTemplatesDir(): string {
  return TEMPLATES_DIR;
}
