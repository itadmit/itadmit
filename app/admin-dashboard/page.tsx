'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProjectData } from '@/components/ProjectSection';
import { Copy, Trash2, Plus, Save, X, ImageIcon, Check } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import TestEmailButton from '@/components/admin/TestEmailButton';

// טיפוס למודל בחירת תמונה
type MediaModalType = 'logo' | 'desktop' | 'mobile' | null;

type ImageFileEntry = { name: string; path: string; uploadedAt?: number };

/** למודל רקע דסקטופ/מובייל — מאחד לוגואים ורקעים; ממוין לפי הועלה אחרון ראשון */
function mergeLogoAndBackgroundFiles(
  logos: ImageFileEntry[],
  backgrounds: ImageFileEntry[]
): ImageFileEntry[] {
  const seen = new Set<string>();
  const out: ImageFileEntry[] = [];
  for (const f of [...logos, ...backgrounds]) {
    if (seen.has(f.path)) continue;
    seen.add(f.path);
    out.push(f);
  }
  out.sort((a, b) => (b.uploadedAt ?? 0) - (a.uploadedAt ?? 0));
  return out;
}

function imageSourceKind(path: string): 'logo' | 'bg' {
  return path.includes('/logos/') ? 'logo' : 'bg';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [logoFiles, setLogoFiles] = useState<Array<{name: string; path: string}>>([]);
  const [bgFiles, setBgFiles] = useState<Array<{name: string; path: string}>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<ProjectData | null>(null);
  const [uploading, setUploading] = useState<{type: string; progress: number} | null>(null);
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [mediaModal, setMediaModal] = useState<MediaModalType>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  const handleDeleteImage = async (imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('האם אתה בטוח שברצונך למחוק את התמונה לצמיתות?')) return;

    setDeletingImage(imagePath);

    try {
      const res = await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        loadImages();
        alert('התמונה נמחקה בהצלחה!');
      } else {
        alert(data.error || 'שגיאה במחיקת התמונה');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('שגיאה במחיקת התמונה');
    } finally {
      setDeletingImage(null);
    }
  };

  const [siteSettingsEdit, setSiteSettingsEdit] = useState({
    moreProjectsBackground: '/images/bg/bg-contact.jpg',
    moreProjectsBackgroundMobile: '/images/bg/bg-contact.jpg',
    contactBackground: '/images/bg/bg-contact-2.jpg',
    contactBackgroundMobile: '/images/bg/bg-contact-2.jpg',
  });

  useEffect(() => {
    // בדיקת אימות
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    if (!authenticated) return;
    
    // טעינת פרויקטים
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        if (data.length > 0) {
          const first = data[0];
          setSelectedProject(first);
          setIsEditing(true);
          setEditedProject({ ...first });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading projects:', err);
        setLoading(false);
      });

    // טעינת תמונות
    loadImages();

    fetch('/api/site-settings')
      .then((r) => r.json())
      .then(
        (data: {
          moreProjectsBackground?: string;
          moreProjectsBackgroundMobile?: string;
          contactBackground?: string;
          contactBackgroundMobile?: string;
        }) => {
          const mp =
            data.moreProjectsBackground ?? '/images/bg/bg-contact.jpg';
          const ct =
            data.contactBackground ?? '/images/bg/bg-contact-2.jpg';
          setSiteSettingsEdit({
            moreProjectsBackground: mp,
            moreProjectsBackgroundMobile:
              data.moreProjectsBackgroundMobile ?? mp,
            contactBackground: ct,
            contactBackgroundMobile: data.contactBackgroundMobile ?? ct,
          });
        }
      )
      .catch(() => {});
  }, [authenticated]);

  const loadImages = () => {
    fetch('/api/images', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          console.error('Error loading images:', res.status, t.slice(0, 200));
          setLogoFiles([]);
          setBgFiles([]);
          return null;
        }
        return res.json() as Promise<{
          logos?: { name: string; path: string }[];
          backgrounds?: { name: string; path: string }[];
        }>;
      })
      .then((data) => {
        if (!data) return;
        setLogoFiles(data.logos || []);
        setBgFiles(data.backgrounds || []);
      })
      .catch((err) => {
        console.error('Error loading images:', err);
        setLogoFiles([]);
        setBgFiles([]);
      });
  };

  /** רשימת הקבצים במודל בחירת תמונה — לדסקטופ/מובייל מאוחדים לוגואים + רקעים */
  const mediaModalPickerFiles = useMemo(() => {
    if (!mediaModal) return [];
    if (mediaModal === 'logo') return logoFiles;
    return mergeLogoAndBackgroundFiles(logoFiles, bgFiles);
  }, [mediaModal, logoFiles, bgFiles]);

  const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
    setUploading({ type, progress: 0 });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // רענון רשימת התמונות
        loadImages();
        
        // אם אנחנו בעריכה, עדכן את הפרויקט עם התמונה החדשה
        if (editedProject) {
          if (type === 'logo') {
            setEditedProject({ ...editedProject, logoSrc: data.path });
          } else {
            setEditedProject({ ...editedProject, backgroundImage: data.path });
          }
        }
        
        alert(`הקובץ ${data.fileName} הועלה בהצלחה!`);
      } else {
        const msg =
          typeof data?.error === 'string' ? data.error : 'שגיאה בהעלאת הקובץ';
        alert(msg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('שגיאה בהעלאת הקובץ');
    } finally {
      setUploading(null);
    }
  };

  /** העלאת רקע לסקשני הבית — לא משנה את פרויקט העריכה */
  const handleSiteBackgroundUpload = async (
    file: File,
    applyPath: (path: string) => void
  ) => {
    setUploading({ type: 'background', progress: 0 });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'background');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        loadImages();
        applyPath(data.path);
        alert(
          `הקובץ ${data.fileName} הועלה ושויך לרקע. אל תשכח ללחוץ "שמור רקעים".`
        );
      } else {
        const msg =
          typeof data?.error === 'string' ? data.error : 'שגיאה בהעלאת הקובץ';
        alert(msg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('שגיאה בהעלאת הקובץ');
    } finally {
      setUploading(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch('/api/projects/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        // רענון רשימת הפרויקטים
        const updated = await fetch('/api/projects').then(r => r.json());
        setProjects(updated);
        const dup = data.project;
        setSelectedProject(dup);
        setIsEditing(true);
        setEditedProject({ ...dup });
        alert('הפרויקט שוכפל בהצלחה!');
      }
    } catch (error) {
      alert('שגיאה בשכפול הפרויקט');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        if (selectedProject?.id === id) {
          const next = updated[0] || null;
          setSelectedProject(next);
          if (next) {
            setIsEditing(true);
            setEditedProject({ ...next });
          } else {
            setIsEditing(false);
            setEditedProject(null);
          }
        }
        alert('הפרויקט נמחק בהצלחה!');
      }
    } catch (error) {
      alert('שגיאה במחיקת הפרויקט');
    }
  };

  const handleSave = async () => {
    if (!editedProject) return;

    const isNew = !projects.some(p => p.id === editedProject.id);

    try {
      const res = await fetch('/api/projects', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProject),
      });

      if (res.ok) {
        const updated = await fetch('/api/projects').then(r => r.json());
        setProjects(updated);
        setSelectedProject(editedProject);
        setIsEditing(false);
        setEditedProject(null);
        alert('הפרויקט נשמר בהצלחה!');
      } else {
        alert('שגיאה בשמירת הפרויקט');
      }
    } catch (error) {
      alert('שגיאה בשמירת הפרויקט');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProject({ ...selectedProject! });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProject(null);
  };

  const handleSaveSiteSettings = async () => {
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettingsEdit),
      });
      if (res.ok) alert('הגדרות הרקע נשמרו');
      else alert('שגיאה בשמירה');
    } catch {
      alert('שגיאה בשמירה');
    }
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetProjectId: string) => {
    e.preventDefault();
    
    if (!draggedProject || draggedProject === targetProjectId) {
      setDraggedProject(null);
      return;
    }

    const draggedIndex = projects.findIndex(p => p.id === draggedProject);
    const targetIndex = projects.findIndex(p => p.id === targetProjectId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedProject(null);
      return;
    }

    // יצירת מערך חדש עם הסדר המעודכן
    const newProjects = [...projects];
    const [removed] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, removed);

    // עדכון הסדר ב-API
    try {
      const projectIds = newProjects.map(p => p.id);
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds }),
      });

      if (res.ok) {
        setProjects(newProjects);
        // אם הפרויקט שנבחר הוא אחד מהפרויקטים שנגררו, עדכן אותו
        if (selectedProject?.id === draggedProject) {
          setSelectedProject(removed);
        }
      } else {
        alert('שגיאה בעדכון הסדר');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('שגיאה בעדכון הסדר');
    }

    setDraggedProject(null);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
  };

  if (!authenticated || loading) {
    return <div className="h-screen flex items-center justify-center text-white">טוען...</div>;
  }

  return (
    <AdminShell
      title="פרויקטים"
      subtitle={`${projects.length} פרויקטים באתר • ניתן לגרור לסידור מחדש`}
    >
      <div className="min-w-0">
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-3">
          {/* רשימת פרויקטים */}
          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="min-w-0 shrink text-xl font-semibold">פרויקטים</h2>
              <button
                onClick={() => {
                  const newProject: ProjectData = {
                    id: `project-${Date.now()}`,
                    title: 'פרויקט חדש',
                    description: '',
                    logoSrc: '/images/logos/tadmit-logo.png',
                    siteUrl: '#',
                    whatsappText: 'הצעת מחיר מהירה בקליק',
                  };
                  setSelectedProject(newProject);
                  setIsEditing(true);
                  setEditedProject(newProject);
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_4px_18px_-4px_rgba(16,185,129,0.55)] transition hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
                חדש
              </button>
            </div>
            <div className="max-h-[640px] space-y-1.5 overflow-y-auto overflow-x-hidden pr-0.5">
              {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center text-sm text-white/50">
                  אין פרויקטים. לחצו על &quot;חדש&quot; כדי להוסיף.
                </div>
              ) : (
                projects.map((project) => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, project.id)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    selectedProject?.id === project.id
                      ? 'border-emerald-400/50 bg-emerald-500/10'
                      : 'border-white/5 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
                  } ${draggedProject === project.id ? 'opacity-50' : ''}`}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsEditing(true);
                    setEditedProject({ ...project });
                  }}
                >
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="shrink-0 cursor-move select-none text-white/30">
                        ☰
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-[14px] font-semibold leading-tight text-white">{project.title}</h3>
                        <p className="truncate text-[12px] text-white/50">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(project.id);
                        }}
                        className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                        title="שכפל"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        className="p-1 hover:bg-red-600 rounded"
                        title="מחק"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* עריכת פרויקט */}
          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-6 lg:col-span-2">
            {selectedProject ? (
              <>
                <div className="mb-5 flex items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">
                    {isEditing ? 'עריכת פרויקט' : selectedProject.title}
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 transition hover:border-white/25 hover:bg-white/10"
                    >
                      ערוך
                    </button>
                  )}
                </div>

                {isEditing && editedProject ? (
                  <div className="space-y-6">
                    {/* כותרת */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">כותרת</label>
                      <input
                        type="text"
                        value={editedProject.title}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, title: e.target.value })
                        }
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                      />
                    </div>

                    {/* תיאור */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">תיאור</label>
                      <textarea
                        value={editedProject.description}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, description: e.target.value })
                        }
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded h-32"
                      />
                    </div>

                    {/* לוגו */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">לוגו</label>
                      <div className="flex gap-4 items-center">
                        {editedProject.logoSrc ? (
                          <div className="rounded w-32 h-32 flex items-center justify-center border-2 border-white p-2">
                            <Image
                              src={editedProject.logoSrc}
                              alt="Logo"
                              width={100}
                              height={100}
                              className="object-contain max-h-24"
                            />
                          </div>
                        ) : (
                          <div className="rounded w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-500">
                            <ImageIcon className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setMediaModal('logo')}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          בחר לוגו
                        </button>
                      </div>
                    </div>

                    {/* רקע דסקטופ */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">רקע דסקטופ</label>
                      <div className="flex gap-4 items-center">
                        {editedProject.backgroundImage ? (
                          <div className="relative w-48 h-32 rounded overflow-hidden border border-gray-600">
                            <Image
                              src={editedProject.backgroundImage}
                              alt="Background"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-48 h-32 rounded border-2 border-dashed border-gray-500 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setMediaModal('desktop')}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          בחר תמונה
                        </button>
                      </div>
                    </div>

                    {/* רקע מובייל */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">רקע מובייל (אופציונלי)</label>
                      <div className="flex gap-4 items-center">
                        {editedProject.backgroundImageMobile ? (
                          <div className="relative w-24 h-36 rounded overflow-hidden border border-gray-600">
                            <Image
                              src={editedProject.backgroundImageMobile}
                              alt="Mobile Background"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-36 rounded border-2 border-dashed border-gray-500 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setMediaModal('mobile')}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
                          >
                            <ImageIcon className="w-4 h-4" />
                            בחר תמונה
                          </button>
                          {editedProject.backgroundImageMobile && (
                            <button
                              type="button"
                              onClick={() => setEditedProject({ ...editedProject, backgroundImageMobile: undefined })}
                              className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm"
                            >
                              הסר תמונה
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* קישור לאתר */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">קישור לאתר</label>
                      <input
                        type="url"
                        value={editedProject.siteUrl}
                        onChange={(e) =>
                          setEditedProject({ ...editedProject, siteUrl: e.target.value })
                        }
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                      />
                    </div>

                    {/* כפתורי שמירה */}
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        שמור
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 mb-2">תיאור:</p>
                      <p>{selectedProject.description}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-2">לוגו:</p>
                      {selectedProject.logoSrc && (
                        <div className="inline-block border-2 border-white rounded p-2">
                          <Image
                            src={selectedProject.logoSrc}
                            alt="Logo"
                            width={150}
                            height={75}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                    {/* תמונות רקע */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 mb-2">תמונת מחשב:</p>
                        {selectedProject.backgroundImage ? (
                          <div className="relative w-full h-40 rounded overflow-hidden border border-gray-600">
                            <Image
                              src={selectedProject.backgroundImage}
                              alt="Desktop Background"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-40 rounded border border-gray-600 border-dashed flex items-center justify-center text-gray-500">
                            לא נבחרה תמונה
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-400 mb-2">תמונת מובייל:</p>
                        {selectedProject.backgroundImageMobile ? (
                          <div className="relative w-24 h-40 rounded overflow-hidden border border-gray-600 mx-auto md:mx-0">
                            <Image
                              src={selectedProject.backgroundImageMobile}
                              alt="Mobile Background"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-40 rounded border border-gray-600 border-dashed flex items-center justify-center text-gray-500 text-xs text-center mx-auto md:mx-0">
                            לא נבחרה תמונה
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-2">קישור:</p>
                      <a
                        href={selectedProject.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {selectedProject.siteUrl}
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-12">
                בחר פרויקט לעריכה
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">התראות מייל על ליד חדש</h2>
              <p className="mt-1 text-[13px] text-white/55">
                שליחת מייל בדיקה — כדי לוודא שמפתח Resend וכתובת השולח מוגדרים כראוי.
              </p>
            </div>
            <TestEmailButton />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold">רקעים בעמוד הבית</h2>
          <p className="mt-1 mb-5 text-sm text-white/55">
            סקשן &quot;עוד עבודות&quot; ויצירת קשר — דסקטופ ומובייל (מתחת ל־md). אפשר להעלות תמונה ישירות לכל רקע או לבחור מהרשימה. אחרי העלאה לחצו &quot;שמור רקעים&quot;.
          </p>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                עוד עבודות — דסקטופ
              </label>
              <select
                value={siteSettingsEdit.moreProjectsBackground}
                onChange={(e) =>
                  setSiteSettingsEdit((s) => ({
                    ...s,
                    moreProjectsBackground: e.target.value,
                  }))
                }
                className="w-full rounded bg-gray-700 px-4 py-2 text-white"
              >
                {!bgFiles.some(
                  (f) => f.path === siteSettingsEdit.moreProjectsBackground
                ) && (
                  <option value={siteSettingsEdit.moreProjectsBackground}>
                    נתיב נוכחי: {siteSettingsEdit.moreProjectsBackground}
                  </option>
                )}
                {bgFiles.map((file) => (
                  <option key={`mp-${file.path}`} value={file.path}>
                    {file.name}
                  </option>
                ))}
              </select>
              <label className="mt-2 block w-full cursor-pointer rounded bg-blue-600 px-4 py-2 text-center text-sm hover:bg-blue-700">
                {uploading?.type === 'background' ? 'מעלה...' : 'העלה רקע חדש'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading?.type === 'background'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleSiteBackgroundUpload(file, (path) =>
                        setSiteSettingsEdit((s) => ({
                          ...s,
                          moreProjectsBackground: path,
                        }))
                      );
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              <div className="relative mt-3 h-28 w-full overflow-hidden rounded border border-gray-600 bg-black">
                <Image
                  src={siteSettingsEdit.moreProjectsBackground}
                  alt=""
                  fill
                  className="object-cover object-top"
                  unoptimized
                  sizes="400px"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">
                עוד עבודות — מובייל
              </label>
              <select
                value={siteSettingsEdit.moreProjectsBackgroundMobile}
                onChange={(e) =>
                  setSiteSettingsEdit((s) => ({
                    ...s,
                    moreProjectsBackgroundMobile: e.target.value,
                  }))
                }
                className="w-full rounded bg-gray-700 px-4 py-2 text-white"
              >
                {!bgFiles.some(
                  (f) =>
                    f.path === siteSettingsEdit.moreProjectsBackgroundMobile
                ) && (
                  <option
                    value={siteSettingsEdit.moreProjectsBackgroundMobile}
                  >
                    נתיב נוכחי:{' '}
                    {siteSettingsEdit.moreProjectsBackgroundMobile}
                  </option>
                )}
                {bgFiles.map((file) => (
                  <option key={`mpm-${file.path}`} value={file.path}>
                    {file.name}
                  </option>
                ))}
              </select>
              <label className="mt-2 block w-full cursor-pointer rounded bg-blue-600 px-4 py-2 text-center text-sm hover:bg-blue-700">
                {uploading?.type === 'background' ? 'מעלה...' : 'העלה רקע חדש'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading?.type === 'background'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleSiteBackgroundUpload(file, (path) =>
                        setSiteSettingsEdit((s) => ({
                          ...s,
                          moreProjectsBackgroundMobile: path,
                        }))
                      );
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              <div className="relative mt-3 h-28 w-full overflow-hidden rounded border border-gray-600 bg-black">
                <Image
                  src={siteSettingsEdit.moreProjectsBackgroundMobile}
                  alt=""
                  fill
                  className="object-cover object-top"
                  unoptimized
                  sizes="400px"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">
                יצירת קשר — דסקטופ
              </label>
              <select
                value={siteSettingsEdit.contactBackground}
                onChange={(e) =>
                  setSiteSettingsEdit((s) => ({
                    ...s,
                    contactBackground: e.target.value,
                  }))
                }
                className="w-full rounded bg-gray-700 px-4 py-2 text-white"
              >
                {!bgFiles.some(
                  (f) => f.path === siteSettingsEdit.contactBackground
                ) && (
                  <option value={siteSettingsEdit.contactBackground}>
                    נתיב נוכחי: {siteSettingsEdit.contactBackground}
                  </option>
                )}
                {bgFiles.map((file) => (
                  <option key={`ct-${file.path}`} value={file.path}>
                    {file.name}
                  </option>
                ))}
              </select>
              <label className="mt-2 block w-full cursor-pointer rounded bg-blue-600 px-4 py-2 text-center text-sm hover:bg-blue-700">
                {uploading?.type === 'background' ? 'מעלה...' : 'העלה רקע חדש'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading?.type === 'background'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleSiteBackgroundUpload(file, (path) =>
                        setSiteSettingsEdit((s) => ({
                          ...s,
                          contactBackground: path,
                        }))
                      );
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              <div className="relative mt-3 h-28 w-full overflow-hidden rounded border border-gray-600 bg-black">
                <Image
                  src={siteSettingsEdit.contactBackground}
                  alt=""
                  fill
                  className="object-cover object-top"
                  unoptimized
                  sizes="400px"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">
                יצירת קשר — מובייל
              </label>
              <select
                value={siteSettingsEdit.contactBackgroundMobile}
                onChange={(e) =>
                  setSiteSettingsEdit((s) => ({
                    ...s,
                    contactBackgroundMobile: e.target.value,
                  }))
                }
                className="w-full rounded bg-gray-700 px-4 py-2 text-white"
              >
                {!bgFiles.some(
                  (f) => f.path === siteSettingsEdit.contactBackgroundMobile
                ) && (
                  <option value={siteSettingsEdit.contactBackgroundMobile}>
                    נתיב נוכחי:{' '}
                    {siteSettingsEdit.contactBackgroundMobile}
                  </option>
                )}
                {bgFiles.map((file) => (
                  <option key={`ctm-${file.path}`} value={file.path}>
                    {file.name}
                  </option>
                ))}
              </select>
              <label className="mt-2 block w-full cursor-pointer rounded bg-blue-600 px-4 py-2 text-center text-sm hover:bg-blue-700">
                {uploading?.type === 'background' ? 'מעלה...' : 'העלה רקע חדש'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading?.type === 'background'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleSiteBackgroundUpload(file, (path) =>
                        setSiteSettingsEdit((s) => ({
                          ...s,
                          contactBackgroundMobile: path,
                        }))
                      );
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              <div className="relative mt-3 h-28 w-full overflow-hidden rounded border border-gray-600 bg-black">
                <Image
                  src={siteSettingsEdit.contactBackgroundMobile}
                  alt=""
                  fill
                  className="object-cover object-top"
                  unoptimized
                  sizes="400px"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveSiteSettings}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_18px_-4px_rgba(16,185,129,0.55)] transition hover:bg-emerald-400"
          >
            <Save className="h-4 w-4" />
            שמור רקעים
          </button>
        </div>
      </div>

      {/* מודל בחירת תמונה */}
      {mediaModal && editedProject && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setMediaModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[82vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1729] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* כותרת המודל */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-700 p-4">
              <div className="min-w-0">
                <h3 className="text-xl font-bold">
                  {mediaModal === 'logo' && 'בחר לוגו'}
                  {mediaModal === 'desktop' && 'בחר תמונת רקע — מחשב'}
                  {mediaModal === 'mobile' && 'בחר תמונת רקע — מובייל'}
                </h3>
                {(mediaModal === 'desktop' || mediaModal === 'mobile') && (
                  <p className="mt-1 text-sm text-gray-400">
                    מוצגות כל התמונות מתיקיות הלוגואים והרקעים — אפשר לבחור כל קובץ גם לדסקטופ וגם
                    למובייל.
                  </p>
                )}
              </div>
              <button
                onClick={() => setMediaModal(null)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* כפתור העלאה */}
            <div className="p-4 border-b border-gray-700">
              <label className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded cursor-pointer inline-flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                {uploading ? 'מעלה...' : 'העלה תמונה חדשה'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, mediaModal === 'logo' ? 'logo' : 'background');
                    }
                  }}
                  disabled={!!uploading}
                />
              </label>
            </div>

            {/* גריד תמונות */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className={`grid gap-4 ${
                mediaModal === 'logo' 
                  ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5' 
                  : mediaModal === 'mobile'
                    ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}>
                {mediaModalPickerFiles.map((file) => {
                  const isSelected = 
                    (mediaModal === 'logo' && editedProject.logoSrc === file.path) ||
                    (mediaModal === 'desktop' && editedProject.backgroundImage === file.path) ||
                    (mediaModal === 'mobile' && editedProject.backgroundImageMobile === file.path);

                  return (
                    <div
                      key={file.path}
                      onClick={() => {
                        if (mediaModal === 'logo') {
                          setEditedProject({ ...editedProject, logoSrc: file.path });
                        } else if (mediaModal === 'desktop') {
                          setEditedProject({ ...editedProject, backgroundImage: file.path });
                        } else if (mediaModal === 'mobile') {
                          setEditedProject({ ...editedProject, backgroundImageMobile: file.path });
                        }
                        setMediaModal(null);
                      }}
                      className={`group relative cursor-pointer rounded-lg overflow-hidden transition-all hover:scale-105 ${
                        isSelected 
                          ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-gray-800' 
                          : 'hover:ring-2 hover:ring-blue-400'
                      } ${
                        mediaModal === 'logo' 
                          ? 'aspect-square border-2 border-white/50 p-2' 
                          : mediaModal === 'mobile'
                            ? 'aspect-[9/16]'
                            : 'aspect-video'
                      }`}
                    >
                      <Image
                        src={file.path}
                        alt={file.name}
                        fill
                        className={mediaModal === 'logo' ? 'object-contain' : 'object-cover'}
                      />
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {/* כפתור מחיקה */}
                      <button
                        onClick={(e) => handleDeleteImage(file.path, e)}
                        disabled={deletingImage === file.path}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        title="מחק תמונה"
                      >
                        {deletingImage === file.path ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        {(mediaModal === 'desktop' || mediaModal === 'mobile') && (
                          <p className="mb-1 text-[10px] font-medium text-emerald-200/95">
                            {imageSourceKind(file.path) === 'logo'
                              ? 'לוגו'
                              : 'רקע'}
                          </p>
                        )}
                        <p className="text-xs text-white truncate">{file.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* הודעה אם אין תמונות */}
              {mediaModalPickerFiles.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>אין תמונות זמינות</p>
                  <p className="text-sm">העלה תמונה חדשה להתחלה</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

