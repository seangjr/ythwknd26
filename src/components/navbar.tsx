import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex flex-col items-center justify-center py-4 md:py-8">
      <Link href="/">
        <Image
          src="/assets/masthead-white.svg"
          alt="Logo for YTHWKND 2026"
          className="w-[200] md:w-[250]"
          width={250}
          height={100}
        />
      </Link>
    </nav>
  );
}
