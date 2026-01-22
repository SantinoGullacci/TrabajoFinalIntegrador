import { useRef, useState, useLayoutEffect } from 'react';

interface TextAnimationProps {
  text: string;
}

const TextAnimation = ({ text }: TextAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // useLayoutEffect se ejecuta antes de que el usuario vea el cambio,
  // evitando parpadeos. Mide los elementos.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;

    if (container && textEl) {
      // Compara: ¿Es el ancho del texto (scrollWidth) mayor que el ancho del contenedor (clientWidth)?
      const hasOverflow = textEl.scrollWidth > container.clientWidth;
      setIsOverflowing(hasOverflow);
    }
  }, [text]); // Se recalcula si el texto cambia

  return (
    // Este div es la "ventana" de tamaño fijo (btn-text-container)
    <div className="btn-text-container" ref={containerRef}>
      {/* Este span es el texto que puede ser muy largo */}
      <span
        ref={textRef}
        // Si se detectó overflow, agregamos la clase CSS mágica
        className={`btn-text-content ${isOverflowing ? 'is-overflowing' : ''}`}
      >
        {text}
      </span>
    </div>
  );
};

export default TextAnimation;
