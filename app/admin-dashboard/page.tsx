'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProjectData } from '@/components/ProjectSection';
import { Copy, Trash2, Plus, Save, X, LogOut } from 'lucide-react';

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
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </button>
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
                      <div className="flex gap-4 mb-4">
                        {editedProject.logoSrc && (
                          <div className="bg-white p-4 rounded w-32 h-32 flex items-center justify-center">
                            <Image
                              src={editedProject.logoSrc}
                              alt="Logo"
                              width={100}
                              height={100}
                              className="object-contain max-h-24"
                            />
                          </div>
                        )}
                        <select
                          value={editedProject.logoSrc}
                          onChange={(e) =>
                            setEditedProject({ ...editedProject, logoSrc: e.target.value })
                          }
                          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded"
                        >
                          {logoFiles.map((file) => (
                            <option key={file.path} value={file.path}>
                              {file.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* רקע דסקטופ */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">רקע דסקטופ</label>
                      <div className="flex gap-4 mb-4">
                        {editedProject.backgroundImage && (
                          <div className="relative w-48 h-32 rounded overflow-hidden">
                            <Image
                              src={editedProject.backgroundImage}
                              alt="Background"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col gap-2">
                          <select
                            value={editedProject.backgroundImage || ''}
                            onChange={(e) =>
                              setEditedProject({
                                ...editedProject,
                                backgroundImage: e.target.value || undefined,
                              })
                            }
                            className="bg-gray-700 text-white px-4 py-2 rounded"
                          >
                            <option value="">בחר רקע</option>
                            {bgFiles.map((file) => (
                              <option key={file.path} value={file.path}>
                                {file.name}
                              </option>
                            ))}
                          </select>
                          <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-center cursor-pointer text-sm">
                            {uploading?.type === 'background' ? 'מעלה...' : 'העלה רקע חדש'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'background');
                              }}
                              disabled={uploading?.type === 'background'}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* רקע מובייל */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">רקע מובייל (אופציונלי)</label>
                      <div className="flex gap-4 mb-4">
                        {editedProject.backgroundImageMobile && (
                          <div className="relative w-24 h-36 rounded overflow-hidden">
                            <Image
                              src={editedProject.backgroundImageMobile}
                              alt="Mobile Background"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col gap-2">
                          <select
                            value={editedProject.backgroundImageMobile || ''}
                            onChange={(e) =>
                              setEditedProject({
                                ...editedProject,
                                backgroundImageMobile: e.target.value || undefined,
                              })
                            }
                            className="bg-gray-700 text-white px-4 py-2 rounded"
                          >
                            <option value="">אין רקע מובייל</option>
                            {bgFiles.map((file) => (
                              <option key={file.path} value={file.path}>
                                {file.name}
                              </option>
                            ))}
                          </select>
                          <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-center cursor-pointer text-sm">
                            {uploading?.type === 'background' ? 'מעלה...' : 'העלה רקע מובייל חדש'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'background');
                              }}
                              disabled={uploading?.type === 'background'}
                            />
                          </label>
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
                        <Image
                          src={selectedProject.logoSrc}
                          alt="Logo"
                          width={150}
                          height={75}
                          className="object-contain bg-white p-2 rounded"
                        />
                      )}
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
    </div>
  );
}

