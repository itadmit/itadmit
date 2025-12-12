'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { projects } from '../page';

export default function AdminPage() {
  const [logoFiles, setLogoFiles] = useState<string[]>([]);
  const [bgFiles, setBgFiles] = useState<string[]>([]);
  const [editedProjects, setEditedProjects] = useState(projects);
  const [selectedProject, setSelectedProject] = useState(0);

  useEffect(() => {
    // טעינת רשימת הקבצים מה-API
    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        // המרת מערך אובייקטים למערך שמות קבצים
        const logoNames = (data.logos || []).map((logo: { name: string; path: string }) => logo.name);
        const bgNames = (data.backgrounds || []).map((bg: { name: string; path: string }) => bg.name);
        
        setLogoFiles(logoNames);
        setBgFiles(bgNames);
      })
      .catch((err) => {
        console.error('Failed to load images from API:', err);
        // אם אין API, נשתמש ברשימה סטטית
        setLogoFiles([
          'aline-cohen-logo.jpeg',
          'aline-logo.jpg',
          'eden-fines-logo.png',
          'incence-logo.png',
          'incense-logo.png',
          'israel-bidur-logo.png',
          'jone-logo.png',
          'juv-logo.png',
          'labeaute-logo.png',
          'mali-logo.png',
          'miel logo.png',
          'olier-logo.png',
          'orshpitz-logo.png',
          'port-logo.png',
          'ruze-logo.png',
          'tadmit-logo.png'
        ]);
        
        setBgFiles([
          'hero1.jpg',
          'eden-bg.jpg',
          'einav-bg.jpg',
          'einav-d.jpg',
          'aline-bg.jpeg',
          'aline-d.jpeg',
          'talia-bg.jpg',
          'talia-m.jpg',
          'olier-bg.jpg',
          'orshpitz-bg.jpeg',
          'orshpitz-m.jpg',
          'daniel-bg.jpeg',
          'barbercy-bg.jpg',
          'jorden-bg.jpg',
          'shay-d.jpg',
          'kim-d.jpg',
          'kim-m.jpg',
          'romi-m.jpg',
          'barbarsi-d.jpeg',
          'port-d.jpg',
          'contact-d.jpg',
          'mobile.jpg'
        ]);
      });
  }, []);

  const updateProject = (index: number, field: string, value: string) => {
    const updated = [...editedProjects];
    updated[index] = { ...updated[index], [field]: value };
    setEditedProjects(updated);
  };

  const copyToClipboard = () => {
    const jsonOutput = JSON.stringify(editedProjects, null, 2);
    navigator.clipboard.writeText(jsonOutput);
    alert('JSON הועתק ללוח! 📋');
  };

  const currentProject = editedProjects[selectedProject];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">ניהול פרויקטים - שיוך תמונות</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* רשימת פרויקטים */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">בחר פרויקט</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {editedProjects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(index)}
                  className={`w-full text-right p-3 rounded transition-colors ${
                    selectedProject === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {index + 1}. {project.title}
                </button>
              ))}
            </div>
          </div>

          {/* עריכת פרויקט נבחר */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">עריכת: {currentProject.title}</h2>
            
            <div className="space-y-6">
              {/* תצוגה נוכחית */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4">תצוגה נוכחית</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">לוגו נוכחי:</p>
                    <div className="bg-white p-4 rounded flex items-center justify-center h-32">
                      <Image
                        src={currentProject.logoSrc}
                        alt={currentProject.title}
                        width={100}
                        height={100}
                        className="object-contain max-h-28"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/tadmit-logo.png';
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{currentProject.logoSrc}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">רקע נוכחי (דסקטופ):</p>
                    <div className="relative h-32 rounded overflow-hidden">
                      <Image
                        src={currentProject.backgroundImage}
                        alt="Background"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/bg/hero1.jpg';
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{currentProject.backgroundImage}</p>
                  </div>
                </div>
              </div>

              {/* בחירת לוגו */}
              <div>
                <label className="block text-lg font-semibold mb-3">בחר לוגו:</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto bg-gray-700 p-3 rounded">
                  {logoFiles.map((logo) => (
                    <button
                      key={logo}
                      onClick={() => updateProject(selectedProject, 'logoSrc', `/images/logos/${logo}`)}
                      className={`relative h-20 bg-white rounded overflow-hidden border-2 transition-all ${
                        currentProject.logoSrc === `/images/logos/${logo}`
                          ? 'border-blue-500 ring-2 ring-blue-400'
                          : 'border-transparent hover:border-gray-400'
                      }`}
                      title={logo}
                    >
                      <Image
                        src={`/images/logos/${logo}`}
                        alt={logo}
                        fill
                        className="object-contain p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* בחירת רקע דסקטופ */}
              <div>
                <label className="block text-lg font-semibold mb-3">בחר רקע (דסקטופ):</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto bg-gray-700 p-3 rounded">
                  {bgFiles.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => updateProject(selectedProject, 'backgroundImage', `/images/bg/${bg}`)}
                      className={`relative h-24 rounded overflow-hidden border-2 transition-all ${
                        currentProject.backgroundImage === `/images/bg/${bg}`
                          ? 'border-blue-500 ring-2 ring-blue-400'
                          : 'border-transparent hover:border-gray-400'
                      }`}
                      title={bg}
                    >
                      <Image
                        src={`/images/bg/${bg}`}
                        alt={bg}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs p-1 truncate">
                        {bg}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* בחירת רקע מובייל */}
              <div>
                <label className="block text-lg font-semibold mb-3">בחר רקע (מובייל) - אופציונלי:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto bg-gray-700 p-3 rounded">
                  <button
                    onClick={() => updateProject(selectedProject, 'backgroundImageMobile', '')}
                    className="h-24 bg-gray-600 rounded flex items-center justify-center text-sm border-2 border-transparent hover:border-gray-400"
                  >
                    ללא רקע מובייל
                  </button>
                  {bgFiles.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => updateProject(selectedProject, 'backgroundImageMobile', `/images/bg/${bg}`)}
                      className={`relative h-24 rounded overflow-hidden border-2 transition-all ${
                        currentProject.backgroundImageMobile === `/images/bg/${bg}`
                          ? 'border-green-500 ring-2 ring-green-400'
                          : 'border-transparent hover:border-gray-400'
                      }`}
                      title={bg}
                    >
                      <Image
                        src={`/images/bg/${bg}`}
                        alt={bg}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs p-1 truncate">
                        {bg}
                      </div>
                    </button>
                  ))}
                </div>
                {currentProject.backgroundImageMobile && (
                  <p className="text-xs text-gray-400 mt-2">נבחר: {currentProject.backgroundImageMobile}</p>
                )}
              </div>

              {/* כפתורי ניווט */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setSelectedProject(Math.max(0, selectedProject - 1))}
                  disabled={selectedProject === 0}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 py-3 rounded font-bold transition-colors"
                >
                  ← פרויקט קודם
                </button>
                <button
                  onClick={() => setSelectedProject(Math.min(editedProjects.length - 1, selectedProject + 1))}
                  disabled={selectedProject === editedProjects.length - 1}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 py-3 rounded font-bold transition-colors"
                >
                  פרויקט הבא →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* כפתור העתקת JSON */}
        <div className="mt-8 text-center">
          <button
            onClick={copyToClipboard}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            📋 העתק JSON מעודכן ללוח
          </button>
          <p className="text-gray-400 mt-4">
            לאחר העתקת ה-JSON, העתק אותו ל-app/page.tsx במשתנה projects
          </p>
          <a
            href="/"
            className="inline-block mt-4 text-blue-400 hover:text-blue-300 underline"
          >
            ← חזרה לאתר
          </a>
        </div>
      </div>
    </div>
  );
}

