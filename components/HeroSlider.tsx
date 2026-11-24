"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { formatLabels, getPhotos } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { useCatalog } from "./CatalogProvider";
import { ArrowIcon, PauseIcon, PlayIcon } from "./LineIcons";
import { useProductDetails } from "./ProductDetailsProvider";

const SLIDE_SECONDS = 6;
const SWIPE_PX = 48;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

const pad = (value: number) => String(value).padStart(2, "0");

// Um produto de cada vez na área principal: o frasco funde-se com o verde do fundo e, por baixo, o nome,
// o preço e o acesso à ficha. Avança sozinho, pára com o rato por cima ou com o foco do teclado, tem botão
// de pausa e não arranca se o sistema pedir menos movimento.
export function HeroSlider() {
  const products = useCatalog();
  const { openDetails } = useProductDetails();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);
  // No servidor assume-se movimento reduzido: a apresentação só arranca no navegador.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );

  const total = products.length;
  const autoplay = !reducedMotion;
  const running = autoplay && !paused && !hovered && !focused && inView;

  // Fora do ecrã, a apresentação espera.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const go = (next: number) => setIndex((next + total) % total);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    go(index + step);
  };

  // Só o foco do teclado pára a apresentação; um clique com o rato não a deixa parada.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target.matches(":focus-visible")) setFocused(true);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null) return;
    const distance = event.clientX - start;
    if (Math.abs(distance) > SWIPE_PX) go(index + (distance < 0 ? 1 : -1));
  };

  if (total === 0) return null;
  const product = products[index];

  return (
    <div
      ref={rootRef}
      className="hero-stage"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Produtos AXON"
      style={{ "--slide-duration": `${SLIDE_SECONDS}s` } as CSSProperties}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setHovered(false)}
    >
      <div
        className="hero-stage__media"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        {products.map((item, slideIndex) => {
          const [cover] = getPhotos(item);
          const active = slideIndex === index;
          return (
            <div key={item.slug} className={`hero-stage__slide${active ? " is-active" : ""}`} aria-hidden={!active}>
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 899px) 92vw, 600px"
                loading={slideIndex === 0 ? "eager" : undefined}
                fetchPriority={slideIndex === 0 ? "high" : undefined}
                className="hero-stage__image"
                draggable={false}
              />
            </div>
          );
        })}
      </div>

      <div className="hero-stage__progress">
        <ol className="hero-stage__steps">
          {products.map((item, stepIndex) => (
            <li key={item.slug}>
              <button
                type="button"
                className="hero-stage__step"
                aria-label={`Mostrar ${item.name}`}
                aria-current={stepIndex === index ? "true" : undefined}
                onClick={() => go(stepIndex)}
              >
                <span className="hero-stage__bar" aria-hidden="true">
                  {stepIndex === index && autoplay && (
                    <span
                      key={index}
                      className="hero-stage__fill"
                      style={{ animationPlayState: running ? "running" : "paused" }}
                      onAnimationEnd={() => go(index + 1)}
                    />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
        {autoplay && (
          <button
            type="button"
            className="hero-stage__pause"
            aria-label={paused ? "Retomar a apresentação" : "Pausar a apresentação"}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <PlayIcon width={14} height={14} /> : <PauseIcon width={14} height={14} />}
          </button>
        )}
      </div>

      <div key={product.slug} className="hero-stage__caption" aria-live={running ? "off" : "polite"}>
        <div className="hero-stage__product">
          <p className="hero-stage__meta">
            {formatLabels[product.format]}
            <span aria-hidden="true">
              {pad(index + 1)} / {pad(total)}
            </span>
          </p>
          <p className="hero-stage__name">{product.name}</p>
          <p className="hero-stage__tagline">{product.tagline}</p>
        </div>
        <div className="hero-stage__buy">
          <p className={`hero-stage__price${product.priceCents === null ? " is-pending" : ""}`}>
            {formatPrice(product.priceCents)}
          </p>
          <button type="button" className="hero-stage__cta" aria-haspopup="dialog" onClick={() => openDetails(product)}>
            Ver produto<span className="sr-only">: {product.name}</span>
            <ArrowIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
