import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCustomer } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCustomer();
  return (
    <>
      <Header signedIn={customer != null} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
