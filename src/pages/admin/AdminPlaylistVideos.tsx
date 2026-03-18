import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Edit, Trash2, PlayCircle, FileText, Youtube } from 'lucide-react';
import { getPlaylistById, getPlaylistVideos, createVideo, updateVideo, deleteVideo, getPlaylistPDFs, createPDF, updatePDF, deletePDF, importYoutubePlaylist } from '@/services/api';
import type { Playlist, Video, PDF, SubjectType } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminPlaylistVideos() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('videos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingPdf, setEditingPdf] = useState<PDF | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    duration: 0,
    order_index: 0,
  });

  const [ytImportUrl, setYtImportUrl] = useState('');
  const [importTab, setImportTab] = useState('single');

  const [pdfFormData, setPdfFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    pdf_url: '',
    order_index: 0,
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    if (id) {
      loadData();
    }
  }, [profile, navigate, id]);

  const loadData = async () => {
    if (!id) return;

    setIsLoading(true);
    const [playlistData, videosData, pdfsData] = await Promise.all([
      getPlaylistById(id),
      getPlaylistVideos(id),
      getPlaylistPDFs(id),
    ]);
    setPlaylist(playlistData);
    setVideos(videosData);
    setPdfs(pdfsData);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.thumbnail_url || !formData.video_url || !playlist) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const videoData = {
      ...formData,
      duration: formData.duration || 600, // Default 10 minutes if not set
      playlist_id: playlist.id,
      subject_id: playlist.subject_id,
      subject: 'NEET' as const, // Will be updated based on subject_id
      is_featured: false,
    };

    const { error } = editingVideo
      ? await updateVideo(editingVideo.id, videoData)
      : await createVideo(videoData);

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
        description: editingVideo ? 'Video updated successfully' : 'Video added successfully',
      });
      setIsDialogOpen(false);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    const { error } = await deleteVideo(videoId);

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
      loadData();
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
      order_index: video.order_index,
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
      order_index: videos.length,
    });
    setYtImportUrl('');
    setImportTab('single');
  };

  const handleYoutubeImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytImportUrl || !id) return;

    setIsSaving(true);
    try {
      const response = await importYoutubePlaylist(id, ytImportUrl);
      if (response.imported_count > 0) {
        toast({
          title: 'Success',
          description: `Successfully imported ${response.imported_count} videos from YouTube.`,
        });
        setIsDialogOpen(false);
        resetForm();
        loadData();
      } else {
        toast({
          title: 'Import Result',
          description: (response as any).message || 'No videos were imported.',
          variant: (response as any).errors?.length ? 'destructive' : 'default',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to import playlist',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
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

  // PDF CRUD Functions
  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !playlist) return;

    setIsSaving(true);

    // Get subject from subject_id
    const subjectMap: Record<string, SubjectType> = {
      'neet': 'NEET',
      'python': 'Python',
      'java': 'Java',
    };

    const subject = subjectMap[playlist.subject_id] || 'Python';

    const pdfData = {
      ...pdfFormData,
      playlist_id: id,
      subject_id: playlist.subject_id,
      subject: subject,
      download_url: pdfFormData.pdf_url, // Use pdf_url as download_url
      page_count: 0, // Default page count
    };

    const { error } = editingPdf
      ? await updatePDF(editingPdf.id, pdfData)
      : await createPDF(pdfData);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: editingPdf ? 'PDF updated successfully' : 'PDF created successfully',
      });
      setIsPdfDialogOpen(false);
      resetPdfForm();
      loadData();
    }

    setIsSaving(false);
  };

  const handlePdfDelete = async (pdfId: string) => {
    if (!confirm('Are you sure you want to delete this PDF?')) {
      return;
    }

    const { error } = await deletePDF(pdfId);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'PDF deleted successfully',
      });
      loadData();
    }
  };

  const handlePdfEdit = (pdf: PDF) => {
    setEditingPdf(pdf);
    setPdfFormData({
      title: pdf.title,
      description: pdf.description || '',
      thumbnail_url: pdf.thumbnail_url,
      pdf_url: pdf.pdf_url,
      order_index: pdf.order_index,
    });
    setIsPdfDialogOpen(true);
  };

  const resetPdfForm = () => {
    setEditingPdf(null);
    setPdfFormData({
      title: '',
      description: '',
      thumbnail_url: '',
      pdf_url: '',
      order_index: pdfs.length,
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/playlists')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Button>
            <h1 className="text-2xl font-bold">Manage Content</h1>
          </div>
          <p className="text-sm text-primary-foreground/80">
            {playlist?.title || 'Loading...'} - Videos & PDFs
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="videos" className="rounded-[1.25rem]">
              <PlayCircle size={16} strokeWidth={1.5} className="mr-2" />
              Videos ({videos.length})
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="rounded-[1.25rem]">
              <FileText size={16} strokeWidth={1.5} className="mr-2" />
              PDFs ({pdfs.length})
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-0 space-y-4">
            {/* Add Video Button */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full rounded-[1.25rem]">
                  <Plus size={20} strokeWidth={1.5} className="mr-2" />
                  Add Video to Playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[1.25rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Content to Playlist'}</DialogTitle>
                </DialogHeader>

                {editingVideo ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Video Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="rounded-[1.25rem]"
                        placeholder="e.g., Introduction to Variables"
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
                        placeholder="Brief description of the video content"
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
                          if (url.includes('<iframe')) {
                            const srcMatch = url.match(/src=["']([^"']+)["']/);
                            if (srcMatch) url = srcMatch[1];
                          }
                          const youtubeId = extractYouTubeId(url);
                          let newFormData = { ...formData, video_url: url };
                          if (youtubeId) {
                            if (!formData.thumbnail_url || formData.thumbnail_url.includes('img.youtube.com')) {
                              newFormData.thumbnail_url = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
                            }
                          }
                          setFormData(newFormData);
                        }}
                        className="rounded-[1.25rem]"
                      />
                      {extractYouTubeId(formData.video_url) ? (
                        <p className="text-[10px] text-primary font-medium px-2">✓ YouTube Video Detected</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Supports: YouTube, Google Drive, Vimeo, or direct URLs</p>
                      )}
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
                      <Label htmlFor="order_index">Order in Playlist</Label>
                      <Input
                        id="order_index"
                        type="number"
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                        className="rounded-[1.25rem]"
                      />
                    </div>

                    <Button type="submit" className="w-full rounded-[1.25rem]" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Update Video'}
                    </Button>
                  </form>
                ) : (
                  <Tabs value={importTab} onValueChange={setImportTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 rounded-[1.25rem]">
                      <TabsTrigger value="single" className="rounded-[1.25rem]">Single Video</TabsTrigger>
                      <TabsTrigger value="youtube" className="rounded-[1.25rem]">YouTube Playlist</TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="space-y-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Video Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="rounded-[1.25rem]"
                            placeholder="e.g., Introduction to Variables"
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
                              if (url.includes('<iframe')) {
                                const srcMatch = url.match(/src=["']([^"']+)["']/);
                                if (srcMatch) url = srcMatch[1];
                              }
                              const youtubeId = extractYouTubeId(url);
                              if (youtubeId) {
                                setFormData({
                                  ...formData,
                                  video_url: url,
                                  thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
                                });
                              } else {
                                setFormData({ ...formData, video_url: url });
                              }
                            }}
                            className="rounded-[1.25rem]"
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

                        <Button type="submit" className="w-full rounded-[1.25rem]" disabled={isSaving}>
                          {isSaving ? 'Adding...' : 'Add Video'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="youtube" className="space-y-6 pt-4 text-center">
                      <div className="space-y-2 mb-4">
                        <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                          <Youtube size={24} />
                        </div>
                        <h3 className="font-bold text-lg">YouTube Bulk Import</h3>
                        <p className="text-sm text-muted-foreground px-4">
                          Enter a YouTube playlist URL to automatically import all videos, thumbnails, and descriptions.
                        </p>
                      </div>

                      <form onSubmit={handleYoutubeImport} className="space-y-4 text-left">
                        <div className="space-y-2">
                          <Label htmlFor="yt_url">YouTube Playlist URL</Label>
                          <Input
                            id="yt_url"
                            value={ytImportUrl}
                            onChange={(e) => setYtImportUrl(e.target.value)}
                            className="rounded-[1.25rem]"
                            placeholder="https://www.youtube.com/playlist?list=..."
                          />
                        </div>
                        <Button type="submit" className="w-full rounded-[1.25rem] bg-red-600 hover:bg-red-700 h-12" disabled={isSaving}>
                          {isSaving ? 'Importing Videos...' : 'Start Bulk Import'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                )}
              </DialogContent>
            </Dialog>

            {/* Videos List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-video w-full rounded-[1.25rem] bg-muted" />
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {videos.map((video, index) => (
                  <Card key={video.id} className="border-0 shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col">
                        {/* Thumbnail */}
                        <div className="relative w-full aspect-video rounded-t-lg overflow-hidden bg-muted">
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-contain bg-black"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <PlayCircle size={32} className="text-white" strokeWidth={1.5} />
                          </div>
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                            #{index + 1}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h3 className="font-bold text-base line-clamp-2 mb-2">
                            {video.title}
                          </h3>
                          {video.description && !video.description.includes('Part of imported playlist') && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {video.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mb-4">
                            Duration: {formatDuration(video.duration)}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(video)}
                              className="rounded-[1.25rem] flex-1"
                            >
                              <Edit size={16} strokeWidth={1.5} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(video.id)}
                              className="rounded-[1.25rem] flex-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 size={16} strokeWidth={1.5} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <PlayCircle size={48} className="mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
                <p className="text-muted-foreground mb-4">No videos in this playlist yet</p>
                <Button onClick={() => setIsDialogOpen(true)} className="rounded-[1.25rem]">
                  <Plus size={20} strokeWidth={1.5} className="mr-2" />
                  Add Your First Video
                </Button>
              </div>
            )}
          </TabsContent>

          {/* PDFs Tab */}
          <TabsContent value="pdfs" className="mt-0 space-y-4">
            {/* Add PDF Button */}
            <Dialog open={isPdfDialogOpen} onOpenChange={(open) => {
              setIsPdfDialogOpen(open);
              if (!open) resetPdfForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full rounded-[1.25rem]">
                  <Plus size={20} strokeWidth={1.5} className="mr-2" />
                  Add PDF to Playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[1.25rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPdf ? 'Edit PDF' : 'Add New PDF'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePdfSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pdf_title">PDF Title *</Label>
                    <Input
                      id="pdf_title"
                      value={pdfFormData.title}
                      onChange={(e) => setPdfFormData({ ...pdfFormData, title: e.target.value })}
                      className="rounded-[1.25rem]"
                      placeholder="e.g., Java Programming Notes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf_description">Description</Label>
                    <Textarea
                      id="pdf_description"
                      value={pdfFormData.description}
                      onChange={(e) => setPdfFormData({ ...pdfFormData, description: e.target.value })}
                      className="rounded-[1.25rem]"
                      rows={3}
                      placeholder="Brief description of the PDF content"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf_url">PDF URL *</Label>
                    <Input
                      id="pdf_url"
                      value={pdfFormData.pdf_url}
                      onChange={(e) => setPdfFormData({ ...pdfFormData, pdf_url: e.target.value })}
                      className="rounded-[1.25rem]"
                      placeholder="https://drive.google.com/file/d/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Google Drive share link or direct PDF URL
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf_thumbnail_url">Thumbnail URL *</Label>
                    <Input
                      id="pdf_thumbnail_url"
                      value={pdfFormData.thumbnail_url}
                      onChange={(e) => setPdfFormData({ ...pdfFormData, thumbnail_url: e.target.value })}
                      className="rounded-[1.25rem]"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf_order_index">Order in Playlist</Label>
                    <Input
                      id="pdf_order_index"
                      type="number"
                      value={pdfFormData.order_index}
                      onChange={(e) => setPdfFormData({ ...pdfFormData, order_index: parseInt(e.target.value) || 0 })}
                      className="rounded-[1.25rem]"
                      placeholder="0"
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-[1.25rem]" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingPdf ? 'Update PDF' : 'Add PDF'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* PDFs List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-[3/4] w-full rounded-[1.25rem] bg-muted" />
                ))}
              </div>
            ) : pdfs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pdfs.map((pdf) => (
                  <Card key={pdf.id} className="border-0 shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col">
                        {/* Thumbnail */}
                        <div className="relative w-full aspect-[3/4] rounded-t-lg overflow-hidden bg-muted">
                          <img
                            src={pdf.thumbnail_url}
                            alt={pdf.title}
                            className="w-full h-full object-contain bg-black"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <FileText size={48} className="text-white" strokeWidth={1.5} />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h3 className="font-bold text-base line-clamp-2 mb-2">{pdf.title}</h3>
                          {pdf.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {pdf.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <span>Order: {pdf.order_index}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePdfEdit(pdf)}
                              className="rounded-[1.25rem] flex-1"
                            >
                              <Edit size={16} strokeWidth={1.5} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePdfDelete(pdf.id)}
                              className="rounded-[1.25rem] flex-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 size={16} strokeWidth={1.5} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
                <p className="text-muted-foreground mb-4">No PDFs in this playlist yet</p>
                <Button onClick={() => setIsPdfDialogOpen(true)} className="rounded-[1.25rem]">
                  <Plus size={20} strokeWidth={1.5} className="mr-2" />
                  Add Your First PDF
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
