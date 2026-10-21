import Link from "next/link";
import { Logo } from "./Logo";

/** Нэвтрээгүй хэрэглэгчийн дээд мөр. */
export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/login" className="btn-primary ml-auto !py-2">
          Нэвтрэх
        </Link>
      </div>
    </header>
  );
}
