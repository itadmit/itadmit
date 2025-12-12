'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function MoreProjectsSection() {
  return (
    <section 
      id="more-projects" 
      className="h-screen w-screen flex items-center justify-center relative snap-start snap-always overflow-hidden bg-black"
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/59 z-0 elementor-background-overlay" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="max-w-4xl text-center space-y-8 px-6">
          
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            רגע, זה לא הכל...<br />
            רוצה לראות את כל העבודות?
          </h2>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8">
            
            {/* View Full Portfolio */}
            <Link 
              href="/portfolio"
              className="inline-flex items-center gap-3 bg-transparent border-2 border-white text-white px-8 py-3 text-base font-medium hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>מעבר לתיק עבודות המלא</span>
            </Link>

            {/* Contact Button */}
            <a 
              href="#contact"
              className="inline-flex items-center gap-3 bg-transparent border-2 border-white text-white px-8 py-3 text-base font-medium hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>מספיק לי ואני רוצה לדבר איתכם</span>
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}

