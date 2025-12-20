'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProjectData } from '@/components/ProjectSection';
import { Copy, Trash2, Plus, Save, X, LogOut, ImageIcon, Check, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';

// טיפוס למודל בחירת תמונה
type MediaModalType = 'logo' | 'desktop' | 'mobile' | null;

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
        // רענון רשימת התמונות
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
          setSelectedProject(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading projects:', err);
        setLoading(false);
      });

    // טעינת תמונות
    loadImages();
  }, [authenticated]);

  const loadImages = () => {
    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        setLogoFiles(data.logos || []);
        setBgFiles(data.backgrounds || []);
      })
      .catch(err => console.error('Error loading images:', err));
  };

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
        alert('שגיאה בהעלאת הקובץ');
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
        setSelectedProject(data.project);
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
          setSelectedProject(updated[0] || null);
        }
        alert('הפרויקט נמחק בהצלחה!');
      }
    } catch (error) {
      alert('שגיאה במחיקת הפרויקט');
    }
  };

  const handleSave = async () => {
    if (!editedProject) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
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

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
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
    <div className="min-h-screen bg-gray-900 text-white p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">ניהול פרויקטים</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin-dashboard/leads"
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              לידים
            </Link>
            <Link
              href="/admin-dashboard/questions"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              שאלות
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              התנתק
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* רשימת פרויקטים */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">פרויקטים</h2>
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
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                חדש
              </button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {projects.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  אין פרויקטים. לחץ על &quot;חדש&quot; כדי להוסיף פרויקט.
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
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedProject?.id === project.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } ${
                    draggedProject === project.id ? 'opacity-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsEditing(false);
                    setEditedProject(null);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-gray-500 text-xs cursor-move select-none">☰</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-gray-400 truncate">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(project.id);
                        }}
                        className="p-1 hover:bg-gray-500 rounded"
                        title="שכפל"
                      >
                        <Copy className="w-4 h-4" />
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
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            {selectedProject ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {isEditing ? 'עריכת פרויקט' : selectedProject.title}
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
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
      </div>

      {/* מודל בחירת תמונה */}
      {mediaModal && editedProject && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setMediaModal(null)}
        >
          <div 
            className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* כותרת המודל */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold">
                {mediaModal === 'logo' && 'בחר לוגו'}
                {mediaModal === 'desktop' && 'בחר תמונת מחשב'}
                {mediaModal === 'mobile' && 'בחר תמונת מובייל'}
              </h3>
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
                {(mediaModal === 'logo' ? logoFiles : bgFiles).map((file) => {
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
                        <p className="text-xs text-white truncate">{file.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* הודעה אם אין תמונות */}
              {((mediaModal === 'logo' && logoFiles.length === 0) ||
                (mediaModal !== 'logo' && bgFiles.length === 0)) && (
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
    </div>
  );
}

