'use client';

import Image from 'next/image';
import { ChevronLeft, MessageCircle, ArrowDown, Sparkles } from 'lucide-react';

const WHATSAPP_PHONE = '972542284283';
const LABEL_WHATSAPP = 'הצעת מחיר בוואטסאפ';
const LABEL_BOT =
  'חדש: הצעת מחיר מלאה מהבוט שלנו בלי לדבר עם אף אחד';

export interface ProjectData {
  id: string;
  logoSrc: string;
  logoWidth?: number;
  logoHeight?: number;
  title: string;
  description: string;
  siteUrl: string;
  whatsappText?: string;
  isLast?: boolean;
  backgroundImage?: string;
  backgroundImageMobile?: string; // תמונת רקע למובייל
}

export default function ProjectSection({
  project,
  nextId,
  onOpenQuoteBot,
}: {
  project: ProjectData;
  nextId?: string;
  /** פותח מודל בוט הצעת מחיר */
  onOpenQuoteBot?: () => void;
}) {
  const waMessage =
    project.whatsappText?.trim() ||
    `היי, הגעתי מהאתר (עמוד ${project.title}) ואשמח להצעת מחיר בוואטסאפ.`;
  const waHref = `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(waMessage)}`;
  return (
    <section 
      id={project.id} 
      className="h-screen w-screen relative snap-start snap-always overflow-hidden"
    >
      {/* Full Screen Background Image - Desktop */}
      <div 
        className="hidden md:block absolute inset-0 w-full h-full"
        style={{
          backgroundImage: project.backgroundImage ? `url(${project.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark Overlay - מוחשכת */}
        <div className="itadmit-bg-overlay absolute inset-0 z-0 bg-black/59" />
      </div>
      
      {/* Full Screen Background Image - Mobile */}
      <div 
        className="block md:hidden absolute inset-0 w-full h-full"
        style={{
          backgroundImage: (project.backgroundImageMobile || project.backgroundImage) ? `url(${project.backgroundImageMobile || project.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark Overlay - מוחשכת */}
        <div className="itadmit-bg-overlay absolute inset-0 z-0 bg-black/59" />
      </div>
      
      {/* Content Container - על התמונה המוחשכת */}
      <div className="relative z-10 h-full w-full flex flex-col items-start justify-center px-4 sm:px-5 md:px-[12%] lg:px-[14%]" dir="rtl">
        <div className="w-full flex flex-col items-start text-right space-y-3 md:space-y-6">

          {/* Logo - Top Right */}
          <div className="mb-0 w-full md:mb-3">
            <Image
              src={project.logoSrc}
              alt={`${project.title} Logo`}
              width={Math.floor((project.logoWidth || 200) * 0.52)}
              height={Math.floor((project.logoHeight || 100) * 0.52)}
              className="h-auto w-auto max-h-10 md:max-h-16"
              priority
              style={{ marginRight: 0 }}
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.1] md:leading-tight text-right w-full">
            {project.title}
          </h1>

          {/* Description */}
          <p className="text-sm leading-relaxed md:text-lg lg:text-xl text-white max-w-4xl text-right w-full">
            {project.description}
          </p>

          {/* CTAs: צפייה + וואטסאפ בשורה, בוט מתחת — גדלים כמו קודם */}
          <div className="flex flex-col gap-3 pt-2 md:gap-4 md:pt-8 items-start w-full max-w-4xl">
            <div className="flex flex-nowrap items-center gap-2 md:flex-wrap md:gap-4">
              {project.siteUrl !== '#' && (
                <a
                  href={project.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded border-2 border-white bg-transparent px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white hover:text-black md:gap-2 md:px-8 md:py-3 md:text-base"
                >
                  <span>צפייה באתר</span>
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" aria-hidden />
                </a>
              )}

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded bg-[#25D366] px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#20BA5A] md:flex-none md:gap-2 md:px-8 md:py-3 md:text-base"
              >
                <span className="truncate">{LABEL_WHATSAPP}</span>
                <MessageCircle className="h-4 w-4 shrink-0 md:h-5 md:w-5" aria-hidden />
              </a>
            </div>

            {onOpenQuoteBot ? (
              <button
                type="button"
                onClick={() => onOpenQuoteBot()}
                className="inline-flex items-center gap-1.5 rounded border-2 border-white bg-transparent px-3 py-2 text-right text-[12.5px] font-medium text-white transition-colors hover:bg-white hover:text-black md:gap-2 md:px-8 md:py-3 md:text-base"
              >
                <span>{LABEL_BOT}</span>
                <Sparkles className="h-4 w-4 shrink-0 md:h-5 md:w-5" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        {/* Scroll Arrow - Bottom Center */}
        {!project.isLast && nextId && (
          <a 
            href={`#${nextId}`}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white hover:opacity-75 transition-opacity cursor-pointer"
            id="nexta"
          >
            <span className="text-sm animate-bounce">לפרוייקט הבא</span>
            <ArrowDown className="w-7 h-7 animate-bounce" />
          </a>
        )}
      </div>
    </section>
  );
}
