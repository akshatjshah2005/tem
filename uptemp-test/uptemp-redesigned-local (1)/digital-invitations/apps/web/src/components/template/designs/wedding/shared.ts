import type { RenderModel, TemplateSection } from '@/lib/template/types';

export interface SectionProps {
  model: RenderModel;
  section: TemplateSection;
}

export function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function bool(value: unknown, fallback = true): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Splits the interpolated `Bride & Groom` label into displayable lines. */
export function splitCoupleNames(couple: string): { first: string; second: string } {
  const parts = couple.split('&');
  return { first: parts[0].trim(), second: parts.slice(1).join('&').trim() };
}
