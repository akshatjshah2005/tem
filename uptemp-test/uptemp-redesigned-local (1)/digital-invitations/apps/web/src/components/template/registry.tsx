import type { RenderModel } from '@/lib/template/types';
import type { ReactElement } from 'react';
import FallbackDesign from './designs/FallbackDesign';
import WeddingDesign from './designs/wedding/WeddingDesign';

export type DesignComponent = (props: { model: RenderModel }) => ReactElement | null;

/**
 * Maps a template's `config.impl` value onto a design implementation.
 * Templates are configuration driven: adding a variant never requires a new
 * page or a new React component, only a new entry here when a genuinely new
 * visual language is introduced.
 */
const registry: Record<string, DesignComponent> = {
  wedding: WeddingDesign,
  default: FallbackDesign
};

export default function resolveDesign(impl?: string | null): DesignComponent {
  if (impl && registry[impl]) return registry[impl];
  return FallbackDesign;
}

export { FallbackDesign, WeddingDesign };
