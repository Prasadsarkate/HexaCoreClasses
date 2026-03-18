import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, PlayCircle, BookOpen, TrendingUp, Clock, Sparkles, Award, Target, ChevronRight, CheckCircle, Flame, Star, Zap, AlertCircle, User, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFeaturedVideo, getSubjects, getRecentPDFs, getPlaylists, getUserProgress, getArticles, getAssetUrl } from '@/services/api';
import type { PDF, Playlist, Subject, Video, Article } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import CourseCard from '@/components/common/CourseCard';
import PageMeta from '@/components/common/PageMeta';

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [recentPDFs, setRecentPDFs] = useState<PDF[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    loadData();
    loadArticles();
  }, [profile]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlaylists(playlists);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = playlists.filter(playlist =>
        playlist.title.toLowerCase().includes(query) ||
        playlist.description?.toLowerCase().includes(query)
      );
      setFilteredPlaylists(filtered);
    }
  }, [searchQuery, playlists]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pdfs, playlistsData, subjectsData] = await Promise.all([
        getRecentPDFs(4),
        getPlaylists(),
        getSubjects()
      ]);
      setRecentPDFs(pdfs || []);
      setPlaylists(playlistsData || []);
      setFilteredPlaylists(playlistsData || []);
      setSubjects(subjectsData || []);

      if (profile) {
        const progressData = await getUserProgress(profile.id);
        setContinueWatching(progressData || []);
      }
    } catch (error) {
      console.error("Failed to load home data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadArticles = async () => {
    setIsArticlesLoading(true);
    try {
      const data = await getArticles();
      setArticles(data || []);
    } catch (error) {
      console.error("Failed to load articles", error);
    } finally {
      setIsArticlesLoading(false);
    }
  };

  const trendingCourses = filteredPlaylists.slice(0, 4);
  const latestArrivals = filteredPlaylists.slice().reverse().slice(0, 4);
  const mostViewed = filteredPlaylists.filter(p => (p.video_count || 0) > 5).slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      <PageMeta
        title="Home"
        description="Welcome to HexaCore Classes. Your ultimate destination for technology, ethical hacking, and professional education. Explore our curated courses and expert articles."
        keywords="HexaCore Classes, home, technology education, ethical hacking, online learning"
      />
      {/* Hero Section */}
      <section className="relative pt-8 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-left-4 duration-700">
              <Sparkles size={14} />
              <span>Future-Ready Education</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
              Master Your Future with <span className="text-primary italic">HexaCore</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Join thousands of students learning world-class skills in programming, design, and business from industry leaders.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-2 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all" onClick={() => navigate('/library')}>
                Get Started Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <Avatar key={i} className="border-4 border-white w-10 h-10 shadow-sm">
                    <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 10}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                ))}
                <div className="w-10 h-10 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm">
                  +12k
                </div>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative animate-in fade-in zoom-in duration-1000 hidden lg:block">
            <div className="relative z-10 w-full aspect-square max-w-md mx-auto bg-gradient-to-tr from-slate-100 to-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 group p-1">
              <div className="absolute inset-0 bg-primary/5 transition-all group-hover:bg-primary/10 duration-700" />
              <div className="relative flex items-center justify-center h-full">
                <Target size={180} className="text-primary opacity-5 transform -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-1 gap-4 w-full px-12">
                    <Card className="p-4 bg-white shadow-2xl border-0 transform -rotate-2 hover:rotate-0 transition-all flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-xl text-green-600 font-bold">100%</div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Job Guaranteed</p>
                        <p className="text-[10px] text-slate-500">Industry oriented courses</p>
                      </div>
                    </Card>
                    <Card className="p-4 bg-white shadow-2xl border-0 transform translate-x-8 translate-y-4 rotate-3 hover:rotate-0 transition-all flex items-center gap-4">
                      <Zap className="text-primary" size={24} />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Fast Learning</p>
                        <p className="text-[10px] text-slate-500">Save 50% of your time</p>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
          </div>
        </div>
      </section>

      {searchQuery ? (
        <section className="space-y-8 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Search className="text-primary" />
              Showing results for "{searchQuery}"
            </h2>
            <Button variant="ghost" onClick={() => setSearchQuery('')}>Clear search</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlaylists.map(playlist => (
              <CourseCard
                key={playlist.id}
                playlist={playlist}
                subject={subjects.find(s => s.id === playlist.subject_id)}
                isEnrolled={continueWatching.some(p => p.playlist_id === playlist.id)}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-24">
          {/* 1st Section: Trending Courses */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Flame className="text-orange-500" size={24} />
                  </div>
                  Trending Courses
                </h2>
                <p className="text-slate-500 font-medium">Top-rated classes that everyone is talking about.</p>
              </div>
              <Button variant="ghost" className="font-extrabold text-primary hover:bg-primary/5 rounded-xl group" onClick={() => navigate('/library')}>
                Explore All <ChevronRight size={18} className="ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {isLoading ? (
                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)
              ) : (
                trendingCourses.map(playlist => (
                  <CourseCard
                    key={playlist.id}
                    playlist={playlist}
                    subject={subjects.find(s => s.id === playlist.subject_id)}
                    isEnrolled={continueWatching.some(p => p.playlist_id === playlist.id)}
                  />
                ))
              )}
            </div>
          </section>

          {/* 2nd Section: Latest Arrivals */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Zap className="text-primary fill-primary" size={24} />
                  </div>
                  Latest Arrivals
                </h2>
                <p className="text-slate-500 font-medium">Freshly added expert content to boost your career.</p>
              </div>
              <Button variant="ghost" className="font-extrabold text-primary hover:bg-primary/5 rounded-xl group" onClick={() => navigate('/library')}>
                View New <ChevronRight size={18} className="ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {isLoading ? (
                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)
              ) : (
                latestArrivals.map(playlist => (
                  <CourseCard
                    key={playlist.id}
                    playlist={playlist}
                    subject={subjects.find(s => s.id === playlist.subject_id)}
                    isEnrolled={continueWatching.some(p => p.playlist_id === playlist.id)}
                  />
                ))
              )}
            </div>
          </section>

          {/* 3rd Section: Explore by Category - Mini Ribbon */}
          <section className="py-8 bg-slate-50/50 -mx-4 sm:-mx-6 lg:-mx-8 px-8 rounded-[2rem] border-y border-slate-100 relative">
            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-primary border border-primary/10 font-bold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-widest text-[9px]">
                    Curated
                  </Badge>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Explore by <span className="text-primary italic">Category</span></h2>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    className="group relative p-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-white shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 text-left flex items-center gap-3 overflow-hidden"
                    onClick={() => navigate(`/library?category=${subject.name}`)}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-500 group-hover:scale-110 shadow-md shadow-slate-200/50 relative z-10 shrink-0"
                      style={{
                        backgroundColor: `${subject.color}15`,
                        color: subject.color,
                      }}
                    >
                      {subject.icon}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-[13px] tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                        {subject.name}
                      </h3>
                      <div className="flex items-center gap-1 text-primary/60 font-black text-[8px] uppercase tracking-widest translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        View Track <ArrowRight size={8} />
                      </div>
                    </div>

                    <div
                      className="absolute top-0 right-0 w-6 h-6 opacity-5 group-hover:opacity-20"
                      style={{
                        background: `linear-gradient(225deg, ${subject.color} 0%, transparent 80%)`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Latest Articles Section - UI Upgrade */}
          <section className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter text-slate-900">Latest <span className="text-primary">Articles</span> & Insights</h2>
                <p className="text-slate-500 font-medium">Industry news, technical tutorials, and career advice.</p>
              </div>
              <Button onClick={() => navigate('/articles')} className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-primary font-bold shadow-lg shadow-slate-200 transition-all">Visit Blog</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isArticlesLoading ? (
                [1, 2].map(i => (
                  <Card key={i} className="group overflow-hidden border-0 shadow-sm bg-white rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-6 p-4">
                    <Skeleton className="w-full sm:w-48 h-48 rounded-[2rem] shrink-0" />
                    <div className="p-4 space-y-4 flex-1 w-full">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </Card>
                ))
              ) : articles.length > 0 ? (
                articles.slice(0, 2).map((article) => (
                  <Card key={article.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-6 p-4" onClick={() => navigate(`/articles/${article.id}`)}>
                    <div className="w-full sm:w-48 h-48 rounded-[2rem] overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center p-2">
                      <img src={getAssetUrl(article.thumbnail_url)} alt={article.title} referrerPolicy="no-referrer" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-4 space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary/10 text-primary border-0 h-6 px-3 text-[10px] font-black uppercase tracking-widest">{article.category}</Badge>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Clock size={12} /> {article.read_time}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">{article.title}</h4>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-white overflow-hidden shadow-sm flex items-center justify-center">
                            {article.author_avatar_url ? (
                              <img
                                src={getAssetUrl(article.author_avatar_url)}
                                alt={article.author_name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={12} className="text-slate-400" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{article.author_name || "HexaCore"}</span>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-primary font-black uppercase tracking-widest text-[10px] items-center gap-2 group/btn">
                          Read <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic">No articles published yet. Check back soon!</p>
                </div>
              )}
            </div>
          </section>

          {/* Newsletter CTA - Redesigned to Horizontal Banner */}
          <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 lg:p-12 text-white shadow-2xl shadow-primary/10">
            {/* Background Pattern/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-slate-900" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-left space-y-4 max-w-xl">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                  <div className="w-8 h-px bg-primary/30" />
                  Join the learning revolution
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">Ready to transform <span className="text-primary italic">your career?</span></h2>
                <p className="text-slate-400 font-medium">Join 50k+ students and get personalized recommendations straight to your inbox.</p>
              </div>

              <div className="w-full lg:max-w-md bg-white/5 backdrop-blur-xl p-1 sm:p-2 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-2xl">
                <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                  <Input
                    className="h-12 sm:h-14 bg-transparent border-0 text-white placeholder:text-slate-500 px-6 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
                    placeholder="name@company.com"
                  />
                  <Button size="lg" className="h-12 sm:h-14 px-8 rounded-[1.25rem] sm:rounded-2xl font-black shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-all whitespace-nowrap">
                    Get Started
                  </Button>
                </form>
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-40">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> 2,403 students online
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trusted by 50+ Global companies</span>
              <div className="hidden lg:block flex-1 h-px bg-white/5" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
