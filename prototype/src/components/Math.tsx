import katex from 'katex';
import { Fragment, memo, useMemo } from 'react';
import { plainToTex } from '../lib/expr';

export const Tex = memo(function Tex({ tex, display = false, className = '' }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { throwOnError: false, displayMode: display, strict: 'ignore' });
    } catch {
      return tex;
    }
  }, [tex, display]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

/** Plain typed math (e.g. "3x+5<=20") rendered as TeX. */
export function MathPlain({ src, className = '' }: { src: string; className?: string }) {
  return <Tex tex={plainToTex(src)} className={className} />;
}

/**
 * Rich text with inline math in $…$ and **bold**. Used for lesson copy, questions and Suu's replies.
 * Newlines become line breaks.
 */
export function Rich({ text, className = '' }: { text: string; className?: string }) {
  const parts = useMemo(() => {
    const out: { k: 't' | 'm' | 'b'; v: string }[] = [];
    const re = /(?<!\\)\$((?:\\\$|[^$])+?)(?<!\\)\$|\*\*([^*]+)\*\*/g;
    let last = 0, m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ k: 't', v: text.slice(last, m.index).replace(/\\\$/g, '$') });
      if (m[1] !== undefined) out.push({ k: 'm', v: m[1] });
      else out.push({ k: 'b', v: m[2] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ k: 't', v: text.slice(last).replace(/\\\$/g, '$') });
    return out;
  }, [text]);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.k === 'm' ? (
          <Tex key={i} tex={p.v} />
        ) : p.k === 'b' ? (
          <strong key={i} className="font-semibold text-ink">{p.v}</strong>
        ) : (
          <Fragment key={i}>
            {p.v.split('\n').map((line, j, arr) => (
              <Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        )
      )}
    </span>
  );
}
