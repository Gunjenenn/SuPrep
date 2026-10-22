import katex from 'katex';
import { memo } from 'react';

/** KaTeX inline/display math. Invalid TeX renders as red source instead of throwing. */
export const Tex = memo(function Tex({
  tex,
  display = false,
  className = '',
}: {
  tex: string;
  display?: boolean;
  className?: string;
}) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: display, strict: 'ignore' });
  // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output is generated from our own TeX, never user HTML
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});
