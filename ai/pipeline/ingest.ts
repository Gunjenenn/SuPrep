// H2 · Source files → SourceQuestion[] → ai/out/questions.json
// Only sources with allowed: true are read. PDF: pdfjs-dist, HTML: cheerio (ask before `bun add`).
import sources from '../data/sources.json';
import { Source } from '../schema';

export function allowedSources() {
  return sources.map((s) => Source.parse(s)).filter((s) => s.allowed);
}

if (import.meta.main) {
  console.log(
    'H2: ingest хийгдээгүй байна. Зөвшөөрөгдсөн эх сурвалж:',
    allowedSources().map((s) => s.id),
  );
}
