import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPlaylistById, getPlaylistVideos, getPlaylistPDFs, getPlaylistProgress, getSubjects, updateVideoProgress } from '@/services/api';
import type { Playlist, Video, VideoProgress, PDF, Subject } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, ArrowRight, PlayCircle, CheckCircle, FileText, Clock, User,
  Share2, Heart, Award, ShieldCheck, Globe, Star, Info, Languages, Calendar,
  Loader2
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import { getAssetUrl } from '@/services/api';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [progress, setProgress] = useState<VideoProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('videos');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, profile]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [playlistData, videosData, pdfsData, subjectsData] = await Promise.all([
        getPlaylistById(id),
        getPlaylistVideos(id),
        getPlaylistPDFs(id),
        getSubjects()
      ]);
      setPlaylist(playlistData);
      setVideos(videosData || []);
      setPdfs(pdfsData || []);
      setSubjects(subjectsData || []);

      if (profile) {
        try {
          const progressData = await getPlaylistProgress(profile.id, id);
          setProgress(progressData as VideoProgress[] || []);
        } catch (e) {
          setProgress([]);
        }
      }
    } catch (error) {
      console.error('Failed to load playlist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = progress.filter(p => p.completed).length;
  const progressPercentage = videos.length > 0 ? (completedCount / videos.length) * 100 : 0;
  const subject = subjects.find(s => s.id === playlist?.subject_id);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}?autoplay=true`);
  };

  const handleEnroll = async () => {
    if (!id || !videos[0]?.id) return;

    // If not logged in, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // If already enrolled, just navigate
    if (progress.length > 0) {
      handleVideoClick(videos[0].id);
      return;
    }

    setIsEnrolling(true);
    try {
      // Create initial progress to "Enroll" the user explicitly
      await updateVideoProgress(user.id, videos[0].id, id, 0, false);

      // Navigate to the video
      handleVideoClick(videos[0].id);
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="flex gap-12">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="hidden lg:block w-80 shrink-0">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <Info className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold">Course Not Found</h2>
        <p className="text-slate-500 mb-6">The course you are looking for might have been moved or removed.</p>
        <Button onClick={() => navigate('/library')} className="rounded-xl">Browse Catalog</Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageMeta
        title={playlist.title}
        description={playlist.description || ""}
        ogImage={getAssetUrl(playlist.thumbnail_url) || ""}
        keywords={`${subject?.name || ''}, ${playlist.title.split(' ').join(', ')}, HexaCore Classes`}
        ogType="course"
      />
      {/* Premium Header / Hero Section */}
      <section className="bg-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 px-8 py-12 lg:py-20 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
          <div className="lg:col-span-8 space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <Link to="/" className="hover:underline">Home</Link>
              <ArrowLeft size={10} className="rotate-180" />
              <Link to="/library" className="hover:underline">Courses</Link>
              <ArrowLeft size={10} className="rotate-180" />
              <span className="text-slate-400">{subject?.name || 'Catalog'}</span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight flex flex-wrap items-center gap-4">
              {playlist.title}
              {progress.length > 0 && (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-500">
                  <CheckCircle size={12} className="mr-1" /> Enrolled
                </Badge>
              )}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">{playlist.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-1.5 text-yellow-500">
                <Star size={16} fill="currentColor" />
                <span className="font-bold">4.9</span>
                <span className="text-slate-500">(2.4k ratings)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <User size={16} />
                <span>12,403 students enrolled</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Info size={14} /> Created by <span className="text-white font-bold">HexaCore Experts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs text-balance">
                <Languages size={14} /> English, Hindi
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Calendar size={14} /> Updated Feb 2026
              </div>
            </div>

            {/* Subject Badge Mobile */}
            <div className="lg:hidden">
              {subject && (
                <Badge style={{ backgroundColor: subject.color }} className="text-white border-0 px-3 py-1">
                  {subject.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 items-start">
        {/* Left Column: Details & Curriculum */}
        <div className="lg:col-span-8 space-y-12">
          {/* Progress Bar (Only for logged in) */}
          {user && videos.length > 0 && (
            <Card className="bg-primary/5 border-primary/10 rounded-3xl overflow-hidden p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 text-sm font-bold">
                <span className="text-slate-900">Your Course Progress</span>
                <span className="text-primary">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2.5 bg-slate-200" />
              <p className="mt-4 text-xs font-semibold text-slate-500 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                {completedCount} of {videos.length} items completed
              </p>
            </Card>
          )}

          {/* Curriculum Tabs */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">What's inside this course</h2>
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="flex gap-2 w-max h-auto bg-transparent p-0 mb-8 overflow-x-auto no-scrollbar">
                <TabsTrigger
                  value="videos"
                  className="rounded-2xl h-11 px-8 font-bold border border-slate-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all shadow-none"
                >
                  Curriculum ({videos.length})
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-2xl h-11 px-8 font-bold border border-slate-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all shadow-none"
                >
                  Resources ({pdfs.length})
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-2xl h-11 px-8 font-bold border border-slate-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all shadow-none"
                >
                  Instructor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="mt-0 space-y-4">
                {videos.map((video, idx) => {
                  const isCompleted = progress.find(p => p.video_id === video.id)?.completed;
                  return (
                    <button
                      key={video.id}
                      onClick={() => handleVideoClick(video.id)}
                      className="w-full group bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 text-left hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all text-sm sm:text-base relative"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:text-primary transition-colors shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{video.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest"><PlayCircle size={10} /> {formatDuration(video.duration)}</span>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-700 border-0 h-5 px-1.5 flex items-center gap-1">
                              <CheckCircle size={10} fill="currentColor" className="text-white" />
                              <span className="text-[10px] uppercase font-extrabold tracking-tighter">Completed</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 p-2 text-slate-300 group-hover:text-primary transition-colors">
                        <PlayCircle size={24} />
                      </div>
                    </button>
                  );
                })}
              </TabsContent>

              <TabsContent value="resources" className="mt-0 space-y-4">
                {pdfs.length > 0 ? (
                  pdfs.map((pdf) => (
                    <button
                      key={pdf.id}
                      onClick={() => navigate(`/pdf/${pdf.id}`)}
                      className="w-full group bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 text-left hover:border-primary/40 hover:shadow-xl transition-all"
                    >
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{pdf.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Study Resource · PDF</p>
                      </div>
                      <Button variant="ghost" className="rounded-xl group-hover:text-primary transition-colors">Open</Button>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[3rem]">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No resource documents available for this course.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <Card className="rounded-[2.5rem] border-slate-50 shadow-none bg-slate-50/50 p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-3xl bg-slate-200 overflow-hidden shrink-0 border-4 border-white shadow-xl">
                      <img src="https://i.pravatar.cc/300?u=instructor" alt="Instructor" />
                    </div>
                    <div className="space-y-4 text-center sm:text-left">
                      <div>
                        <h3 className="text-2xl font-bold">HexaCore Expert Team</h3>
                        <p className="text-primary font-bold">Senior Software Engineering Mentors</p>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm">Industrial professionals with 10+ years of experience in leading tech giants. Dedicated to providing practical, job-oriented skills and mentoring students to reach their peak potential.</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Award size={14} className="text-primary" /> 4.9 Instructor Rating</span>
                        <span className="flex items-center gap-1"><PlayCircle size={14} className="text-primary" /> 24 Courses</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column: Sticky Enroll Card */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-2xl shadow-primary/10">
            <div className="aspect-video relative overflow-hidden bg-slate-900">
              <img src={playlist.thumbnail_url} alt={playlist.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30 cursor-pointer hover:scale-110 transition-transform">
                  <PlayCircle className="text-white w-10 h-10" fill="currentColor" />
                </div>
              </div>
              <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-900 font-extrabold shadow-sm">Preview Course</Badge>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 h-10 px-6 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-sm">100% Free</Badge>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Enrolling...
                    </>
                  ) : progress.length > 0 ? (
                    <>
                      <ArrowRight size={18} /> Continue Learning
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} /> Enroll Course
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full h-14 rounded-2xl text-base font-bold bg-white hover:bg-slate-50 border-slate-200">
                  Add to Wishlist
                </Button>
              </div>

              <div className="space-y-4 pt-4">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Award size={16} className="text-primary" />
                  This course includes:
                </h5>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  <li className="flex items-center gap-3">
                    <PlayCircle size={16} className="text-slate-400" />
                    <span>{videos.length} HD video lectures</span>
                  </li>
                  {pdfs.length > 0 && (
                    <li className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400" />
                      <span>{pdfs.length} Downloadable resources</span>
                    </li>
                  )}
                  <li className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-slate-400" />
                    <span>Lifetime access to content</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Globe size={16} className="text-slate-400" />
                    <span>Access on mobile and TV</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-100">
                <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
                  <Share2 size={18} />
                  <span className="text-[10px] uppercase font-black tracking-tighter">Share</span>
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-red-500 transition-colors">
                  <Heart size={18} />
                  <span className="text-[10px] uppercase font-black tracking-tighter">Wishlist</span>
                </button>
              </div>
            </CardContent>
          </Card>


        </aside>
      </div>
    </div>
  );
}
