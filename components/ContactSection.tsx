'use client';

import { Phone, Mail, Instagram, Facebook, MessageCircle, Navigation } from 'lucide-react';
import { useState, useRef } from 'react';
import { useSectionParallax } from '@/hooks/useSectionParallax';

const bgLayerStyleDesktop = {
  backgroundSize: '100% auto' as const,
  backgroundPosition: 'center top' as const,
  backgroundRepeat: 'no-repeat' as const,
  transformOrigin: 'center top' as const,
};

const bgLayerStyleMobile = {
  backgroundSize: '100% auto' as const,
  backgroundPosition: 'center top' as const,
  backgroundRepeat: 'repeat-y' as const,
  transformOrigin: 'center top' as const,
};

export default function ContactSection({
  backgroundSrc = '/images/bg/bg-contact-2.jpg',
  backgroundSrcMobile,
}: {
  backgroundSrc?: string;
  backgroundSrcMobile?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopBgRef = useRef<HTMLDivElement>(null);
  const mobileBgRef = useRef<HTMLDivElement>(null);
  const mobileSrc = backgroundSrcMobile ?? backgroundSrc;

  useSectionParallax(sectionRef, desktopBgRef, {
    maxScale: 1,
    mainFactor: 0.12,
  }, mobileBgRef);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative h-screen w-screen snap-start snap-always overflow-hidden m-0 p-0 text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
        aria-hidden
      >
        <div
          ref={desktopBgRef}
          className="absolute inset-0 hidden will-change-transform md:block"
          style={{
            ...bgLayerStyleDesktop,
            backgroundImage: `url(${backgroundSrc})`,
          }}
        />
        <div
          ref={mobileBgRef}
          className="absolute inset-0 block will-change-transform md:hidden"
          style={{
            ...bgLayerStyleMobile,
            backgroundImage: `url(${mobileSrc})`,
          }}
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)' }}
          aria-hidden
        />
      </div>

      <div className="relative z-10 h-full overflow-y-auto flex items-start justify-center py-20 px-4">
      <div className="container mx-auto max-w-5xl text-center">
        
        {/* Title */}
        <div className="mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white">רוצה להצטרף למשפחה?</h2>
          <h3 className="text-xl md:text-2xl text-white leading-relaxed">
            <b>או אפילו רק לשמוע עוד פרטים?</b><br />
            ניתן לחייג אלינו בקלות על ידי לחיצה על הכפתור הירוק כאן למטה ו<b>בעוד כ-5 דקות</b><br />
            יש לך הצעת מחיר לאתר...<br />
          </h3>
        </div>

        {/* Quick Action Buttons */}
        <div className="mb-12 flex flex-row flex-nowrap justify-center gap-2 md:gap-4">
          <a
            href="https://api.whatsapp.com/send/?phone=972542284283&text=%D7%94%D7%A6%D7%A2%D7%AA%20%D7%9E%D7%97%D7%99%D7%A8%20%D7%9E%D7%94%D7%99%D7%A8%D7%94"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded bg-green-500 px-3 py-3 text-[13px] font-medium text-white transition-colors hover:bg-green-600 md:gap-3 md:px-8 md:py-4 md:text-base"
          >
            <MessageCircle className="h-4 w-4 shrink-0 md:h-6 md:w-6" />
            <span className="truncate">הצעת מחיר מהירה בוואטסאפ</span>
          </a>

          <a
            href="tel:+972542284283"
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded bg-blue-600 px-3 py-3 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 md:gap-3 md:px-8 md:py-4 md:text-base"
          >
            <Phone className="h-4 w-4 shrink-0 md:h-6 md:w-6" />
            <span className="truncate">חיוג 054-228-4283</span>
          </a>
        </div>

        {/* Contact Form */}
        <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl max-w-3xl mx-auto mb-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                type="text" 
                placeholder="שם מלא" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:outline-none transition-all text-right text-white placeholder-white/60"
                required
              />
              <input 
                type="tel" 
                placeholder="טלפון שאתם זמינים בו" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:outline-none transition-all text-right text-white placeholder-white/60"
                required
              />
            </div>
            <input 
              type="email" 
              placeholder="אימייל תקין" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:outline-none transition-all text-right text-white placeholder-white/60"
              required
            />
            <textarea 
              rows={4}
              placeholder="כמה פרטים שיאפשרו לנו להבין מה אתם רוצים..." 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:outline-none transition-all text-right text-white placeholder-white/60 resize-none"
            />
            
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold leading-tight text-black transition-all hover:bg-white/90 md:gap-3 md:px-6 md:py-4 md:text-xl"
            >
              <Mail className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 md:h-5 md:w-5" />
              <span>אני מעדיף, אשאיר פרטים ותחזרו אליי במייל</span>
            </button>
          </form>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <a
            href="https://api.whatsapp.com/send/?phone=972542284283&text=%D7%94%D7%A6%D7%A2%D7%AA%20%D7%9E%D7%97%D7%99%D7%A8%20%D7%9E%D7%94%D7%99%D7%A8%D7%94"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-white hover:text-green-400 transition-colors"
          >
            <MessageCircle className="w-8 h-8" />
            <span className="text-sm">וואטסאפ</span>
          </a>
          <a 
            href="mailto:Info@itadmit.co.il" 
            className="flex flex-col items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <Mail className="w-8 h-8" />
            <span className="text-sm">דוא״ל</span>
          </a>
          <a 
            href="https://instagram.com/tadmit_interactive" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-white hover:text-pink-400 transition-colors"
          >
            <Instagram className="w-8 h-8" />
            <span className="text-sm">אינסטגרם</span>
          </a>
          <a 
            href="https://facebook.com/tadmitinteractive" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <Facebook className="w-8 h-8" />
            <span className="text-sm">פייסבוק</span>
          </a>
          <a 
            href="tel:0542284283" 
            className="flex flex-col items-center gap-2 text-white hover:text-green-400 transition-colors"
          >
            <Phone className="w-8 h-8" />
            <span className="text-sm">טלפון</span>
          </a>
          <a
            href="https://ul.waze.com/ul?place=ChIJJ0giiiS3AhURsiv2gKFrQP0&ll=31.90124590%2C34.78958690&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-white hover:text-cyan-300 transition-colors"
          >
            <Navigation className="h-8 w-8" />
            <span className="text-sm">ניווט ב-Waze</span>
          </a>
        </div>
        
        {/* Footer Info */}
        <div className="mt-12 text-white/60 text-sm border-t border-white/20 pt-8">
          <p>Info@itadmit.co.il | תדמית אינטראקטיב בניית אתרים וחנויות וירטואליות | 054-2284283 | רחוב פנחס ספיר 8 נס-ציונה.</p>
        </div>
      </div>
      </div>
    </section>
  );
}
