import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SonnerProvider } from "@/components/sonner-provider";
import { TimeRestriction } from "@/components/time-restriction";

export default function EverywhereElseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TimeRestriction>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <SonnerProvider />
    </TimeRestriction>
  );
}
