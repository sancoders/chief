"use client";

import { useEffect, useRef, useState } from "react";

import { generatedAvatar } from "@/lib/avatar";

// Si la foto subida no carga, cae a un avatar generado con las iniciales
// del nombre (el `alt`), no a un retrato de una persona real.
function fallbackFor(alt: string): string {
  return generatedAvatar(alt);
}

export function Foto({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(src);
  const ref = useRef<HTMLImageElement>(null);

  function swap() {
    const fallback = fallbackFor(alt);
    setCurrent((value) => (value === fallback ? value : fallback));
  }

  // Si la imagen falló ANTES de hidratar, onError no se dispara: lo
  // detectamos al montar (complete pero sin dimensiones = rota).
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) swap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={current} alt={alt} className={className} onError={swap} />
  );
}
