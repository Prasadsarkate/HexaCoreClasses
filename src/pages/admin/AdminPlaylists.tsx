import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Video, PlayCircle, Sparkles } from 'lucide-react';
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist, getSubjects, createSubject } from '@/services/api';
import type { Playlist, Subject } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminPlaylists() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');

  const [formData, setFormData] = useState({
    subject_id: '',
    title: '',
    description: '',
    thumbnail_url: '',
    order_index: 0,
    is_active: true,
  });

  // Subject creation state
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    description: '',
    icon: '📂', // Default icon since field is hidden
    image_url: '',
    color: '#3b82f6',
    is_active: true,
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [profile, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    const [playlistsData, subjectsData] = await Promise.all([
      getPlaylists(),
      getSubjects(),
    ]);
    setPlaylists(playlistsData);
    setSubjects(subjectsData);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject_id || !formData.thumbnail_url) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const playlistData = { ...formData, pdf_count: 0 };
    const result = editingPlaylist
      ? await updatePlaylist(editingPlaylist.id, formData)
      : await createPlaylist(playlistData);
    setIsSaving(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: editingPlaylist ? 'Playlist updated successfully' : 'Playlist created successfully',
      });
      setIsDialogOpen(false);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist? All videos in this playlist will be unlinked.')) {
      return;
    }

    const { error } = await deletePlaylist(id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Playlist deleted successfully',
      });
      loadData();
    }
  };

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      subject_id: playlist.subject_id,
      title: playlist.title,
      description: playlist.description || '',
      thumbnail_url: playlist.thumbnail_url,
      order_index: playlist.order_index,
      is_active: playlist.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPlaylist(null);
    setFormData({
      subject_id: '',
      title: '',
      description: '',
      thumbnail_url: '',
      order_index: 0,
      is_active: true,
    });
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectFormData.name || !subjectFormData.icon || !subjectFormData.color) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const { error } = await createSubject(subjectFormData);
    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Subject created successfully',
      });
      setIsSubjectDialogOpen(false);
      setSubjectFormData({
        name: '',
        description: '',
        icon: '📂',
        image_url: '',
        color: '#3b82f6',
        is_active: true,
      });
      loadData();
    }
  };

  const handleManageVideos = (playlistId: string) => {
    navigate(`/admin/playlists/${playlistId}/videos`);
  };

  // --- VIEW 1: SUBJECTS GRID ---
  if (selectedSubject === 'all') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md">
          <div className="px-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </Button>
              <h1 className="text-2xl font-bold">Manage Courses</h1>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Select a course to manage its playlists
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Create Subject Button */}
          <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto rounded-[1.25rem] shadow-sm">
                <Sparkles size={20} strokeWidth={1.5} className="mr-2" />
                Create New Course / Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[1.25rem]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject_name">Course Name *</Label>
                  <Input
                    id="subject_name"
                    value={subjectFormData.name}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                    className="rounded-[1.25rem]"
                    placeholder="e.g., Class 12 Physics"
                  />
                </div>

                <div className="hidden">
                  <Input value={subjectFormData.icon} onChange={() => { }} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject_image">Thumbnail URL (Optional)</Label>
                  <Input
                    id="subject_image"
                    value={subjectFormData.image_url}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, image_url: e.target.value })}
                    className="rounded-[1.25rem]"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject_color">Theme Color *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={subjectFormData.color}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, color: e.target.value })}
                      className="w-20 h-10 rounded-[1.25rem]"
                    />
                    <Input
                      value={subjectFormData.color}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, color: e.target.value })}
                      className="flex-1 rounded-[1.25rem]"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject_description">Description</Label>
                  <Textarea
                    id="subject_description"
                    value={subjectFormData.description}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, description: e.target.value })}
                    className="rounded-[1.25rem]"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full rounded-[1.25rem]" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Course"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Subjects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className="group flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-left h-full hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video bg-muted overflow-hidden">
                    {subject.image_url ? (
                      <img src={subject.image_url} alt={subject.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20" style={{ backgroundColor: subject.color }}>
                        <span className="text-4xl">📂</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs">
                      {playlists.filter(p => p.subject_id === subject.id).length} Playlists
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{subject.description || 'No description'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 2: PLAYLISTS FOR SELECTED SUBJECT ---
  const activeSubject = subjects.find(s => s.id === selectedSubject);
  const filteredPlaylists = playlists.filter(p => p.subject_id === selectedSubject);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSubject('all')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span style={{ color: activeSubject?.color }}>📂</span>
              {activeSubject?.name}
            </h1>
          </div>
          <p className="text-sm text-gray-300">
            Manage playlists inside this course
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Create Playlist Button (Auto-selects current subject) */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
          else if (!editingPlaylist && selectedSubject !== 'all') {
            // Pre-fill subject!
            setFormData(prev => ({ ...prev, subject_id: selectedSubject }));
          }
        }}>
          <DialogTrigger asChild>
            <Button className="w-full rounded-[1.25rem]">
              <Plus size={20} strokeWidth={1.5} className="mr-2" />
              Create New {activeSubject?.name} Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[1.25rem] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden Subject Selection (Since we are inside one) or Disabled */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                  disabled={true} // Lock to current subject
                >
                  <SelectTrigger className="rounded-[1.25rem]">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Playlist Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-[1.25rem]"
                  placeholder="e.g., Chapter 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-[1.25rem]"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL *</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="rounded-[1.25rem]"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_index">Display Order</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="rounded-[1.25rem]"
                />
              </div>

              <Button type="submit" className="w-full rounded-[1.25rem]" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingPlaylist ? 'Update Playlist' : 'Create Playlist'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Playlists Grid for this Subject */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Skeleton className="h-48" />
          </div>
        ) : filteredPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPlaylists.map((playlist) => (
              <Card key={playlist.id} className="border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="relative w-full aspect-video bg-muted overflow-hidden rounded-t-lg">
                    <img src={playlist.thumbnail_url} className="w-full h-full object-contain bg-black" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{playlist.title}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleManageVideos(playlist.id)} className="flex-1 rounded-xl">Videos</Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(playlist)} className="rounded-xl"><Edit size={14} /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(playlist.id)} className="rounded-xl text-red-500"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No playlists in this course yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
