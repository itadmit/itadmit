'use client';

import { useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useSectionParallax } from '@/hooks/useSectionParallax';

const WHATSAPP = '972542284283';

function whatsappHref(message: string) {
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP}&text=${encodeURIComponent(message)}`;
}

const bgLayerStyle = {
  backgroundSize: '100% auto' as const,
  backgroundPosition: 'center top' as const,
  backgroundRepeat: 'no-repeat' as const,
  transformOrigin: 'center top' as const,
};

export default function MoreProjectsSection({
  backgroundSrc = '/images/bg/bg-contact.jpg',
  backgroundSrcMobile,
  onOpenQuoteBot,
}: {
  backgroundSrc?: string;
  /** אם לא מוגדר — משתמשים באותה תמונה כמו בדסקטופ */
  backgroundSrcMobile?: string;
  /** פותח מודל בוט הצעת מחיר */
  onOpenQuoteBot?: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopBgRef = useRef<HTMLDivElement>(null);
  const mobileBgRef = useRef<HTMLDivElement>(null);
  const mobileSrc = backgroundSrcMobile ?? backgroundSrc;

  useSectionParallax(sectionRef, desktopBgRef, {
    maxScale: 1,
    mainFactor: 0.12,
  }, mobileBgRef);

  return (
    <section
      ref={sectionRef}
      id="more-projects"
      className="relative h-screen w-screen snap-start snap-always overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
        aria-hidden
      >
        <div
          ref={desktopBgRef}
          className="absolute inset-0 hidden will-change-transform md:block"
          style={{
            ...bgLayerStyle,
            backgroundImage: `url(${backgroundSrc})`,
          }}
        />
        <div
          ref={mobileBgRef}
          className="absolute inset-0 block will-change-transform md:hidden"
          style={{
            ...bgLayerStyle,
            backgroundImage: `url(${mobileSrc})`,
          }}
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)' }}
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="max-w-4xl text-center space-y-8 px-6">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            טוב, יש עוד המון עבודות אבל באמת שחבל על הזמן...
            <br />
            <span className="text-2xl md:text-4xl font-bold mt-4 inline-block">
              רוצים לשמוע עוד פרטים חייגו אלינו או השאירו פרטים
            </span>
          </h2>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8">
            {onOpenQuoteBot ? (
              <button
                type="button"
                onClick={() => onOpenQuoteBot()}
                className="inline-flex items-center gap-3 border-2 border-white bg-transparent px-8 py-3 text-base font-medium text-white transition-colors hover:bg-white hover:text-black"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>קבלת הצעת מחיר מצ׳אט בוט שלנו</span>
              </button>
            ) : (
              <a
                href={whatsappHref(
                  'שלום, הגעתי מהאתר ואשמח לקבל הצעת מחיר דרך הצ׳אט בוט שלכם.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border-2 border-white bg-transparent px-8 py-3 text-base font-medium text-white transition-colors hover:bg-white hover:text-black"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>קבלת הצעת מחיר מצ׳אט בוט שלנו</span>
              </a>
            )}

            <a
              href={whatsappHref('שלום, הגעתי מהאתר ואשמח לקבל הצעת מחיר בוואטסאפ.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-transparent border-2 border-white text-white px-8 py-3 text-base font-medium hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>קבלת הצעת מחיר בוואטסאפ</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
