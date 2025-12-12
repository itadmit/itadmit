'use client';

import { useState, useEffect, useRef } from 'react';
import Header from "@/components/Header";
import ProjectSection, { ProjectData } from "@/components/ProjectSection";
import ContactSection from "@/components/ContactSection";
import MoreProjectsSection from "@/components/MoreProjectsSection";
import Preloader from "@/components/Preloader";
import MenuPopup from "@/components/MenuPopup";
import CircularTimer from "@/components/CircularTimer";

export const projects: ProjectData[] = [
  {
    id: "aline",
    title: "עדן פינס",
    description: "בניית חנות וירטואלית במערכת שופיפיי למותג טיפוח השיער של עדן פינס. באתר הקפדנו על חווית רכישה נוחה וקלה במיוחד תוך דגש על סטנדרטים בין לאומיים כולל עיצוב לתמונות המוצרים ויצירת שפה גרפית אחידה.",
    logoSrc: "/images/logos/fifi.webp",
    siteUrl: "https://fifi-beauty.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 200,
    backgroundImage: "/images/bg/hero1.jpg"
  },
  {
    id: "einav-bublil",
    title: "עינב בובליל",
    description: "בניית חנות וירטואלית במערכת קוויק שופ לרכישת ספר המתכונים של עינב בובליל, האתר נבנה בדגש על פשטות בתהליך הרכישה תוך דגש על נראות מודרנית ונקייה.",
    logoSrc: "/images/logos/einav.webp",
    siteUrl: "https://einavbooblil.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 250,
    backgroundImage: "/images/bg/einav-d.jpg"
  },
  {
    id: "aline-cohen",
    title: "אלין כהן",
    description: "בניית חנות וירטואלית בין לאומית בשופיפיי, מרהיבה במיוחד למותג הקוסמטיקה של אלין כהן, האתר משלב וידאויים, הנפשות ואנימציות בסטדנרטים בין לאומיים שלא נראו בישראל עד כה.",
    logoSrc: "/images/logos/aline.webp",
    siteUrl: "https://alinecohencosmetics.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 300,
    backgroundImage: "/images/bg/aline-d.jpeg"
  },
  {
    id: "talia-ovadia",
    title: "טליה עובדיה",
    description: "בניית חנות וירטואלית בין לאומית בשופיפיי, מרהיבה במיוחד למותג מוצרי השיער של טליה עובדיה, האתר משלב הנפשות וידאויים וחומרים בסטדנרטים בין לאומיים תוך דגש על עיצוב מודרני עכשווי.",
    logoSrc: "/images/logos/talia.webp",
    siteUrl: "https://criniere.co.il/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 250,
    backgroundImage: "/images/bg/hero1.jpg",
    backgroundImageMobile: "/images/bg/talia-m.jpg"
  },
  {
    id: "olier-paris",
    title: "אולייר פריז",
    description: "בניית חנות וירטואלית במערכת שופיפיי למותג מוצרי השיער אולייר פריז, חנות אלגנטית מודרנית ונקייה כיאה לאופי המותג.",
    logoSrc: "/images/logos/olier.webp",
    siteUrl: "https://oliereparis.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 250,
    backgroundImage: "/images/bg/olier-bg.jpg"
  },
  {
    id: "or",
    title: "אור שפיץ",
    description: "בניית חנות וירטואלית מרהיבה למכירת עוגות, קינוחים ומוצרי אור שפיץ נוספים.",
    logoSrc: "/images/logos/or.webp",
    siteUrl: "https://orshpitz.co.il/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/orshpitz-bg.jpeg",
    backgroundImageMobile: "/images/bg/orshpitz-m.jpg"
  },
  {
    id: "daniel",
    title: "מיאל",
    description: "בניית חנות וירטואלית במערכת שופיפיי למותג בגדי הילדים היוקרתי של דניאל גרינברג. האתר נבנה ועוצב בהתאם לאופי החברה ואיכות המותג היוקרתי.",
    logoSrc: "/images/logos/miel.webp",
    siteUrl: "https://wewearmiel.co.il/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/daniel-bg.jpeg"
  },
  {
    id: "incense",
    title: "אינסנס פרפיום",
    description: "בניית אתר איקומרס מרהיב ובין לאומי בעברית ובאנגלית למותג הבישום המוכר Incense Parfums.",
    logoSrc: "/images/logos/incense.webp",
    siteUrl: "https://incenseparfums.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/einav-bg.jpg",
    backgroundImageMobile: "/images/bg/einav-d.jpg"
  },
  {
    id: "port",
    title: "PORT HOME DESIGN",
    description: "בניית חנות וירטואלית למותג עיצוב הבית של דורין דותן. האתר כולל מותגים בין לאומיים מוכרים מכל העולם. עיצוב נקי, עם נגיעות פסטליות נעימות, כמקובל בארצות הנורדיות – סקנדינביות.",
    logoSrc: "/images/logos/port.webp",
    siteUrl: "https://porthomedesign.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/port-d.jpg"
  },
  {
    id: "labeaute",
    title: "לה בוטה ישראל",
    description: "בנייה והקמת אתר איקומרס בשופיפיי למותג מוצרי השיער המוביל בישראל, האתר הותאם לעומסים גבוהים ותוכנן בקפידה עם דגש על כל פיקסל.",
    logoSrc: "/images/logos/labeaute.webp",
    siteUrl: "https://labeauteisrael.co.il/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/barbercy-bg.jpg"
  },
  {
    id: "juv",
    title: "juv activewear",
    description: "בניית אתר איקומרס בין לאומי לבגדי הספורט של JUV אשר מאפשרים לכל אישה להרגיש במיטבה, נשית, ספורטיבית, סקסית, ראויה ויכולה.",
    logoSrc: "/images/logos/juv.webp",
    siteUrl: "https://juv-activewear.co.il/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/jorden-bg.jpg"
  },
  {
    id: "mali",
    title: "M LIKE MALI",
    description: "בניית אתר איקומרס אלגנטי ונקי בשילוב שוטף של סרטוני וידאו לבושם היוקרתי החדש של מלי לוי.",
    logoSrc: "/images/logos/mlikemali.webp",
    siteUrl: "https://mlikemali.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/eden-bg.jpg"
  },
  {
    id: "ruze",
    title: "RUZE SPORTS",
    description: "בניית אתר איקומרס בין לאומי בעברית ובאנגלית למותג בגדי הספורט ההיסטרי של שי זהבי.",
    logoSrc: "/images/logos/ruze.webp",
    siteUrl: "https://ruzesport.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/shay-d.jpg"
  },
  {
    id: "israelbidur",
    title: "המצעד של ישראל בידור",
    description: "פיתוח אתר חדשני וסופר מתקדם למצעד המוזיקה השבועי של ״ישראל בידור״, הגולשים יכולים להאזין לשירים חדשים, לקרוא כתבות וכמובן - להצביע ולהשפיע על המצעד השבועי.",
    logoSrc: "/images/logos/israelbidur.webp",
    siteUrl: "#",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/hero1.jpg"
  },
  {
    id: "jone",
    title: "J ONE BRANDS",
    description: "אתר בגדי המותגים המוביל בישראל עם חווית רכישה שלא הייתה עד כה בישראל. האתר החדש נבנה במערכת שופיפי ומכיל אפשרויות סינון ופלטור רבות שעוזרות לגולש למצוא את פריט הלבוש שהוא מחפש במהירות ובפשטות.",
    logoSrc: "/images/logos/jonebrand.webp",
    siteUrl: "https://j-onebrands.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/hero1.jpg"
  },
  {
    id: "kim",
    title: "kim kassas couture",
    description: "בניית אתר קטלוג יוקרתי בין לאומי למותג שמלות הכלה והערב קים קסאס.",
    logoSrc: "/images/logos/kim.webp",
    siteUrl: "http://kimkassascouture.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/kim-d.jpg",
    backgroundImageMobile: "/images/bg/kim-m.jpg"
  },
  {
    id: "yochi",
    title: "יוכי אפוליאון",
    description: "בניית חנות וירטואלית למותג האופנה המצליח של יוכי אפוליאון.",
    logoSrc: "/images/logos/yochi.webp",
    siteUrl: "https://www.yochiapolyon.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/hero1.jpg"
  },
  {
    id: "romis",
    title: "רומיס",
    description: "בניית חנות וירטואלית למותג האופנה הפורץ והדינאמי של רומי עפרון.",
    logoSrc: "/images/logos/romiss.webp",
    siteUrl: "https://romiss.co.il/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/romi-m.jpg"
  },
  {
    id: "barbarsi",
    title: "ברברסי",
    description: "בניית חנות וירטואלית עם קונספט ייחודי חצוף ונועז שלא נראה כמותו בישראל.",
    logoSrc: "/images/logos/barbarsi.webp",
    siteUrl: "https://barbarsi.shop/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/barbarsi-d.jpeg"
  },
  {
    id: "jorden",
    title: "jorden jewelry",
    description: "בניית אתר איקומרס בין לאומי, מרהיב ויוקרתי לכוכבת הרשת ירדן חכם למכירת תכשיטים.",
    logoSrc: "/images/logos/jorden.webp",
    siteUrl: "https://jordenjewelry.com/",
    whatsappText: "הצעת מחיר מהירה בקליק",
    logoWidth: 150,
    backgroundImage: "/images/bg/jorden-bg.jpg"
  }
];

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(index);
        }
      });
    };

    if (!showPreloader) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [showPreloader]);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  // כבר לא צריך את ה-useEffect הזה כי הפרילודר מטפל בזה

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTimerComplete = () => {
    // מעבר לסקשן הבא
    const sections = document.querySelectorAll('section[id]');
    const nextSectionIndex = activeSection + 1;
    const nextSection = sections[nextSectionIndex];
    
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
      
      // עדכן את activeSection אחרי שהגלילה מסתיימת
      // זה יגרום ל-resetKey להשתנות והטיימר יתאפס
      setTimeout(() => {
        setActiveSection(nextSectionIndex);
      }, 800); // זמן הגלילה + קצת buffer
    }
  };

  return (
    <>
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
      <main 
        ref={containerRef} 
        className={`h-screen w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black m-0 p-0 transition-opacity duration-700 ${
          showPreloader ? 'opacity-0' : 'opacity-100'
        }`}
      >
      <Header onMenuClick={handleMenuClick} />
      <MenuPopup isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      {/* Navigation Dots - Left Side */}
      <div className="fixed left-6 md:left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        {projects.map((project, index) => (
          <div key={project.id} className="relative group">
            <a
              href={`#${project.id}`}
              className={`w-3 h-3 rounded-full transition-all duration-300 block ${
                activeSection === index 
                  ? 'bg-white scale-150' 
                  : 'bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to ${project.title}`}
            />
            {/* Tooltip */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              <div className="bg-black/90 text-white text-sm px-3 py-2 rounded shadow-lg">
                {project.title}
              </div>
            </div>
          </div>
        ))}
        <div className="relative group">
          <a
            href="#more-projects"
            className={`w-3 h-3 rounded-full transition-all duration-300 block ${
              activeSection === projects.length 
                ? 'bg-white scale-150' 
                : 'bg-white/60 hover:bg-white'
            }`}
            aria-label="Go to more projects"
          />
          {/* Tooltip */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <div className="bg-black/90 text-white text-sm px-3 py-2 rounded shadow-lg">
              עוד עבודות
            </div>
          </div>
        </div>
        <div className="relative group">
          <a
            href="#contact"
            className={`w-3 h-3 rounded-full transition-all duration-300 block ${
              activeSection === projects.length + 1 
                ? 'bg-white scale-150' 
                : 'bg-white/60 hover:bg-white'
            }`}
            aria-label="Go to contact"
          />
          {/* Tooltip */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <div className="bg-black/90 text-white text-sm px-3 py-2 rounded shadow-lg">
              יצירת קשר
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col">
        {projects.map((project, index) => {
          const nextProject = projects[index + 1];
          const nextId = nextProject ? nextProject.id : 'more-projects';
          
          return (
            <ProjectSection 
              key={project.id} 
              project={{...project, isLast: index === projects.length - 1}} 
              nextId={nextId}
            />
          );
        })}
      </div>

      <MoreProjectsSection />
      <ContactSection />
      
      {/* Circular Timer - Bottom Right */}
      {!showPreloader && (
        <CircularTimer 
          resetKey={activeSection}
          duration={8000} 
          onComplete={handleTimerComplete} 
        />
      )}
    </main>
    </>
  );
}
