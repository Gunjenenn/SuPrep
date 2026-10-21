import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

/** Markdown + $математик$ (KaTeX) рендер. */
export function MathMarkdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`md ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** Товч (inline) хувилбар — button дотор хэрэглэхэд. */
export function MathInline({ children }: { children: string }) {
  return (
    <span className="md">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{ p: ({ children: c }) => <span>{c}</span> }}
      >
        {children}
      </ReactMarkdown>
    </span>
  );
}
