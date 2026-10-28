'use client';

import type { RenderModel } from '@/lib/template/types';
import type { CSSProperties } from 'react';
import resolveDesign from './registry';

/**
 * Entry point of the rendering engine.
 *
 * The server builds a serialisable RenderModel from the template config plus
 * invitation data; this component picks the design implementation for
 * `config.impl` and exposes the template design tokens as CSS custom
 * properties so variants stay pure configuration.
 */
export default function TemplateRenderer({ model }: { model: RenderModel }) {
  const Design = resolveDesign(model.template.impl);
  const { palette, typography } = model.template.design;

  const style = {
    '--tpl-paper': palette.paper,
    '--tpl-surface': palette.surface,
    '--tpl-ink': palette.ink,
    '--tpl-muted': palette.muted,
    '--tpl-gold': palette.gold,
    '--tpl-gold-deep': palette.goldDeep,
    '--tpl-gold-soft': palette.goldSoft,
    '--tpl-hero-text': palette.heroText,
    '--tpl-hero-overlay': palette.heroOverlay,
    '--tpl-font-script': typography.script,
    '--tpl-font-serif': typography.serif,
    '--tpl-font-sans': typography.sans
  } as CSSProperties;

  return (
    <div
      className="tpl-root"
      data-variant={model.template.variant}
      data-template={model.template.slug}
      data-testid="template-root"
      style={style}
    >
      <Design model={model} />
    </div>
  );
}
