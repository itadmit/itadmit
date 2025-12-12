'use client';

import { Phone, Mail, Instagram, Facebook, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactSection() {
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
      className="h-screen w-screen bg-black py-20 px-4 snap-start snap-always overflow-y-auto flex items-center justify-center m-0 p-0" 
      id="contact"
    >
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
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <a 
            href="https://api.whatsapp.com/send/?phone=972542284283&text=הצעת%20מחיר%20מהירה%20בקליק"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 text-base font-medium hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span>קבלת הצעת מחיר מהירה ב-Whatsapp</span>
          </a>
          
          <a 
            href="tel:+972542284283"
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 text-base font-medium hover:bg-blue-700 transition-colors"
          >
            <Phone className="w-6 h-6" />
            <span>חיוג מהיר 0542284283</span>
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
              className="w-full bg-white text-black font-bold text-xl py-4 rounded-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2 group"
            >
              <span>אני מפעם, אשאיר פרטים ותחזרו אליי במייל</span>
              <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <a 
            href="https://api.whatsapp.com/send/?phone=972542284283&text=שלום%20הגעתי%20דרך%20האתר%20ואני%20מעוניין%20לקבל%20עוד%20פרטים..."
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
            className="flex flex-col items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <span className="text-2xl">🗺️</span>
            <span className="text-sm">ניווט ב-Waze</span>
          </a>
        </div>
        
        {/* Footer Info */}
        <div className="mt-12 text-white/60 text-sm border-t border-white/20 pt-8">
          <p>Info@itadmit.co.il | תדמית אינטראקטיב בניית אתרים וחנויות וירטואליות | 054-2284283 | רחוב פנחס ספיר 8 נס-ציונה.</p>
        </div>
      </div>
    </section>
  );
}
