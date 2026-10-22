export type RichPart = { k: 't' | 'm' | 'b'; v: string };

/**
 * Split text into plain / $math$ / **bold** parts. "\$" is a literal dollar
 * (e.g. prices: "\$40"). Pure so it can be unit-tested and reused by the tutor.
 */
export function parseRich(text: string): RichPart[] {
  const out: RichPart[] = [];
  const re = /(?<!\\)\$((?:\\\$|[^$])+?)(?<!\\)\$|\*\*([^*]+)\*\*/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ k: 't', v: text.slice(last, m.index).replace(/\\\$/g, '$') });
    if (m[1] !== undefined) out.push({ k: 'm', v: m[1] });
    else out.push({ k: 'b', v: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ k: 't', v: text.slice(last).replace(/\\\$/g, '$') });
  return out;
}
