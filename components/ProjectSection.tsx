import Image from 'next/image';
import { ChevronLeft, MessageCircle, ArrowDown } from 'lucide-react';

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

export default function ProjectSection({ project, nextId }: { project: ProjectData; nextId?: string }) {
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
        <div className="absolute inset-0 bg-black/59 z-0 elementor-background-overlay" />
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
        <div className="absolute inset-0 bg-black/59 z-0 elementor-background-overlay" />
      </div>
      
      {/* Content Container - על התמונה המוחשכת */}
      <div className="relative z-10 h-full w-full flex flex-col items-start justify-center px-6 md:px-[18%]" dir="rtl">
        <div className="w-full flex flex-col items-start text-right space-y-6">
          
          {/* Logo - Top Right */}
          <div className="mb-4 w-full">
            <Image 
              src={project.logoSrc}
              alt={`${project.title} Logo`}
              width={Math.floor((project.logoWidth || 200) * 0.6)}
              height={Math.floor((project.logoHeight || 100) * 0.6)}
              className="h-auto w-auto max-h-20"
              priority
              style={{ marginRight: 0 }}
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight text-right w-full">
            {project.title}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed max-w-3xl text-right w-full">
            {project.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-4 pt-8 items-start w-full max-w-3xl">
            
            {/* View Site Button */}
            {project.siteUrl !== '#' && (
              <a 
                href={project.siteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-3 text-base font-medium hover:bg-white hover:text-black transition-colors rounded"
              >
                <span>צפייה באתר</span>
                <ChevronLeft className="w-5 h-5" />
              </a>
            )}

            {/* WhatsApp Button */}
            <a 
              href={`https://api.whatsapp.com/send/?phone=972542284283&text=${encodeURIComponent(project.whatsappText || 'הצעת מחיר מהירה בקליק')}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3 text-base font-medium hover:bg-[#20BA5A] transition-colors rounded"
            >
              <span>חדש: {project.whatsappText || 'הצעת מחיר מהירה בקליק ישירות ל-Whatsapp'}</span>
              <MessageCircle className="w-5 h-5" />
            </a>

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
