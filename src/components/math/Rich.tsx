import { Fragment, useMemo } from 'react';
import { parseRich } from './parse-rich';
import { Tex } from './Tex';

/** Text with inline math in $…$ and **bold**. Newlines become <br>. */
export function Rich({ text, className = '' }: { text: string; className?: string }) {
  const parts = useMemo(() => parseRich(text), [text]);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.k === 'm' ? (
          <Tex key={i} tex={p.v} />
        ) : p.k === 'b' ? (
          <strong key={i} className="font-semibold text-ink">
            {p.v}
          </strong>
        ) : (
          <Fragment key={i}>
            {p.v.split('\n').map((line, j, arr) => (
              <Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        ),
      )}
    </span>
  );
}
