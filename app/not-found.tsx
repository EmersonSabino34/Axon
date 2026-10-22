import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
    <Header />
    <main className="wrap notfound">
      <p className="eyebrow gold-txt">Página não encontrada</p>
      <h1>Este caminho não existe.</h1>
      <p>A página que procura pode ter mudado de endereço. Veja os nossos produtos ou volte ao início.</p>
      <Link className="btn dark" href="/produtos">Ver produtos</Link>
    </main>
    <Footer />
    </>
  );
}
