import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { getVideos, createVideo, updateVideo, deleteVideo, getSubjects, getPlaylists } from '@/services/api';
import type { Video, SubjectType } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import VideoCard from '@/components/VideoCard';

export default function AdminVideos() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    duration: 0,
    subject: 'NEET' as SubjectType,
    subject_id: null as string | null,
    playlist_id: null as string | null,
    order_index: 0,
    is_featured: false,
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadVideos();
  }, [profile, navigate]);

  const loadVideos = async () => {
    setIsLoading(true);
    const data = await getVideos();
    setVideos(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.thumbnail_url || !formData.video_url) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = editingVideo
      ? await updateVideo(editingVideo.id, formData)
      : await createVideo(formData);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: editingVideo ? 'Video updated successfully' : 'Video created successfully',
      });
      setIsDialogOpen(false);
      resetForm();
      loadVideos();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    setIsLoading(true);
    const { error } = await deleteVideo(id);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      loadVideos();
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      thumbnail_url: video.thumbnail_url,
      video_url: video.video_url,
      duration: video.duration,
      subject: video.subject,
      subject_id: video.subject_id,
      playlist_id: video.playlist_id,
      order_index: video.order_index,
      is_featured: video.is_featured,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      thumbnail_url: '',
      video_url: '',
      duration: 0,
      subject: 'NEET',
      is_featured: false,
      subject_id: null,
      playlist_id: null,
      order_index: 0,
    });
  };

  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch) url = srcMatch[1];
    }
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-md">
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
            <h1 className="text-2xl font-bold">Manage Videos</h1>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Add, edit, or remove video content
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Add Video Button */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full rounded-[1.25rem]">
              <Plus size={20} strokeWidth={1.5} className="mr-2" />
              Add New Video
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[1.25rem] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-[1.25rem]"
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL *</Label>
                <Input
                  id="video_url"
                  placeholder="Paste YouTube or direct video URL"
                  value={formData.video_url}
                  onChange={(e) => {
                    let url = e.target.value.trim();

                    // Handle case where user pastes full iframe embed code
                    if (url.includes('<iframe')) {
                      const srcMatch = url.match(/src=["']([^"']+)["']/);
                      if (srcMatch) url = srcMatch[1];
                    }

                    const youtubeId = extractYouTubeId(url);
                    let newFormData = { ...formData, video_url: url };

                    if (youtubeId) {
                      // If thumbnail is empty or already a YT thumb, auto-populate with high-res YouTube thumb
                      if (!formData.thumbnail_url || formData.thumbnail_url.includes('img.youtube.com')) {
                        newFormData.thumbnail_url = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
                      }
                    }

                    setFormData(newFormData);
                  }}
                  className="rounded-[1.25rem]"
                />
                {extractYouTubeId(formData.video_url) && (
                  <p className="text-[10px] text-primary font-medium px-2">
                    ✓ YouTube Video Detected
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="rounded-[1.25rem]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value as SubjectType })}
                >
                  <SelectTrigger className="rounded-[1.25rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEET">NEET</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Java">Java</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_featured">Featured Video</Label>
              </div>
              <Button type="submit" className="w-full rounded-[1.25rem]" disabled={isLoading}>
                {editingVideo ? 'Update Video' : 'Create Video'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Videos List */}
        <div className="space-y-4">
          {videos.map((video) => (
            <Card key={video.id} className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-0">
                <VideoCard video={video} />
                <div className="p-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(video)}
                    className="flex-1 rounded-[1.25rem]"
                  >
                    <Edit size={16} strokeWidth={1.5} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(video.id)}
                    className="flex-1 rounded-[1.25rem]"
                  >
                    <Trash2 size={16} strokeWidth={1.5} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
