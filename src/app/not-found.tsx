import Link from "next/link";
import { CatIcon } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md card p-10 text-center">
      <div className="mx-auto w-fit">
        <CatIcon size={72} />
      </div>
      <h1 className="mt-4 font-display text-2xl font-black">Хуудас олдсонгүй</h1>
      <p className="mt-1 text-sm text-ink/60">Муур энэ хуудсыг хаа нэгтээ нуучихсан бололтой.</p>
      <Link href="/" className="btn-primary mt-6">
        Нүүр хуудас
      </Link>
    </div>
  );
}
