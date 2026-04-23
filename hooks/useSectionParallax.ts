'use client';

import { useEffect, useCallback, RefObject } from 'react';

export function getScrollParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'scroll' || overflowY === 'auto') return node;
    node = node.parentElement;
  }
  return null;
}

type ParallaxOptions = {
  mainFactor?: number;
  innerFactor?: number;
  /** ברירת מחדל יוצרת זום קל; עם 1 לא חותכים תמונה בגלל scale (חשוב ל-bg עם contain) */
  maxScale?: number;
};

export function useSectionParallax(
  sectionRef: RefObject<HTMLElement | null>,
  desktopBgRef: RefObject<HTMLDivElement | null>,
  options?: ParallaxOptions,
  mobileBgRef?: RefObject<HTMLDivElement | null> | null
) {
  const mainFactor = options?.mainFactor ?? 0.18;
  const innerFactor = options?.innerFactor ?? 0.06;
  const maxScale = options?.maxScale ?? 1.06;

  const updateParallax = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const layers = [desktopBgRef.current, mobileBgRef?.current].filter(
      Boolean
    ) as HTMLDivElement[];
    if (layers.length === 0) return;

    const rect = section.getBoundingClientRect();
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const y =
      (rect.top - vh * 0.5) * mainFactor + section.scrollTop * innerFactor;
    const transform = `translate3d(0, ${y}px, 0) scale(${maxScale})`;
    layers.forEach((el) => {
      el.style.transform = transform;
    });
  }, [mainFactor, innerFactor, maxScale, desktopBgRef, mobileBgRef]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollRoot = getScrollParent(section);
    updateParallax();

    scrollRoot?.addEventListener('scroll', updateParallax, { passive: true });
    section.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);

    return () => {
      scrollRoot?.removeEventListener('scroll', updateParallax);
      section.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
    };
  }, [updateParallax]);
}
