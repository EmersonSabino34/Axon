export function TopBar({ storeOpen = false }: { storeOpen?: boolean }) {
  return (
    <div id="topo" className="top-bar">
      <p className="container top-bar__text">
        {storeOpen ? (
          <>
            Entregas em Portugal <span aria-hidden="true">·</span> MB WAY, Multibanco ou cartão
          </>
        ) : (
          <>
            Coleção em pré-lançamento <span aria-hidden="true">·</span>{" "}
            <a href="#newsletter" className="top-bar__link">
              Seja dos primeiros a saber
            </a>
          </>
        )}
      </p>
    </div>
  );
}
