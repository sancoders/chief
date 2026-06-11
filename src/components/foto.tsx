"use client";

import { useEffect, useRef, useState } from "react";

// Si la foto remota (demo) o subida no carga, cae a un retrato local.
function fallbackFor(src: string): string {
  const match = src.match(/women\/(\d+)\.jpg/);
  return match ? `/demo/mujer-${match[1]}.jpg` : "/demo/mujer-44.jpg";
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
    const fallback = fallbackFor(src);
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
