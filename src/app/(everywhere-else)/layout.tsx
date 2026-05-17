import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SonnerProvider } from "@/components/sonner-provider";
import { TimeRestriction } from "@/components/time-restriction";
import { RegistrationClosed } from "@/components/registration-closed";

export default function EverywhereElseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TimeRestriction>
      <Navbar />
      <RegistrationClosed>
        <main className="flex-1">
          {children}
        </main>
      </RegistrationClosed>
      <Footer />
      <SonnerProvider />
    </TimeRestriction>
  );
}
