"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { ProductPhoto } from "@/lib/collection";
import { ChevronLeftIcon, ChevronRightIcon } from "./LineIcons";

type ProductGalleryProps = {
  photos: ProductPhoto[];
  productName: string;
  /** Largura aproximada em que a foto principal é mostrada (atributo `sizes`). */
  sizes: string;
};

const SWIPE_THRESHOLD = 40;

// Galeria com as 6 fotos de um produto. Use `key={product.slug}` para voltar à primeira foto
// quando o produto muda.
export function ProductGallery({ photos, productName, sizes }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const total = photos.length;

  const go = (next: number) => setIndex((next + total) % total);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") go(index - 1);
    else if (event.key === "ArrowRight") go(index + 1);
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = event.clientX;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(distance) >= SWIPE_THRESHOLD) go(distance < 0 ? index + 1 : index - 1);
  };

  return (
    <div
      className="gallery"
      role="group"
      aria-roledescription="galeria"
      aria-label={`Fotografias de ${productName}`}
      onKeyDown={onKeyDown}
    >
      <div
        className="gallery__viewer"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        {photos.map((photo, photoIndex) => (
          <div
            key={photo.src}
            className={`gallery__slide${photoIndex === index ? " is-active" : ""}`}
            aria-hidden={photoIndex !== index}
          >
            <Image src={photo.src} alt="" fill sizes="64px" className="gallery__backdrop" draggable={false} />
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={sizes}
              className="gallery__image"
              draggable={false}
              loading={photoIndex === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        <button type="button" className="gallery__arrow gallery__arrow--prev" onClick={() => go(index - 1)} aria-label="Foto anterior">
          <ChevronLeftIcon />
        </button>
        <button type="button" className="gallery__arrow gallery__arrow--next" onClick={() => go(index + 1)} aria-label="Foto seguinte">
          <ChevronRightIcon />
        </button>
        <p className="gallery__counter" aria-live="polite">
          <span className="sr-only">Foto </span>
          {index + 1} / {total}
          <span className="sr-only">: {photos[index].caption}</span>
        </p>
      </div>

      <ul className="gallery__thumbs">
        {photos.map((photo, photoIndex) => (
          <li key={photo.src}>
            <button
              type="button"
              className="gallery__thumb"
              onClick={() => setIndex(photoIndex)}
              aria-label={`Ver foto ${photoIndex + 1} de ${total}: ${photo.caption}`}
              aria-current={photoIndex === index ? "true" : undefined}
            >
              <Image src={photo.src} alt="" fill sizes="80px" draggable={false} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
