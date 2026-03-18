import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSubjects, getPlaylists, getUserProgress, getAssetUrl } from '@/services/api';
import type { Subject, Playlist } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, ChevronDown, ListFilter, Sparkles, PlayCircle, BookOpen, Clock, Filter, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import CourseCard from '@/components/common/CourseCard';
import { Badge } from '@/components/ui/badge';
import PageMeta from '@/components/common/PageMeta';

const CATEGORIES = ["All", "Frontend", "Backend", "App Development", "Web Development", "Cyber Security"];
const SKILL_LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export default function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) {
      setActiveCategory(cat);
    }
  }, [searchParams, user]);


  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subjectsData, playlistsData] = await Promise.all([
        getSubjects(),
        getPlaylists(),
      ]);
      setSubjects(subjectsData || []);
      setPlaylists(playlistsData || []);

      if (user) {
        const progressData = await getUserProgress(user.id, true);
        setUserProgress(progressData || []);
      } else {
        setUserProgress([]);
      }
    } catch (error) {
      console.error("Failed to load library data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const enrolledPlaylists = useMemo(() => {
    return playlists.filter(p => userProgress.some(up => up.playlist_id === p.id));
  }, [playlists, userProgress]);

  const discoverPlaylists = useMemo(() => {
    return playlists.filter(p => !userProgress.some(up => up.playlist_id === p.id));
  }, [playlists, userProgress]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === "All") {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const filteredAndSortedDiscover = useMemo(() => {
    let result = [...discoverPlaylists];

    // Search Query
    if (searchQuery) {
      result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by Category
    if (activeCategory !== "All") {
      result = result.filter(p => {
        const subject = subjects.find(s => s.id === p.subject_id);
        return subject?.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
          p.title.toLowerCase().includes(activeCategory.toLowerCase());
      });
    }

    // Filter by Level
    if (activeLevel !== "All Levels") {
      result = result.filter(p => (p as any).level === activeLevel);
    }

    // Sort
    if (sortBy === "Newest") {
      result.sort((a, b) => (b.id > a.id ? 1 : -1));
    } else if (sortBy === "Popular") {
      result.sort((a, b) => (b.video_count || 0) - (a.video_count || 0));
    }

    return result;
  }, [discoverPlaylists, activeCategory, activeLevel, sortBy, subjects, searchQuery]);

  return (
    <div className="min-h-screen pb-24 space-y-12">
      <PageMeta
        title="Course Library"
        description="Explore our extensive library of technology courses, from web development to cyber security. Start learning at your own pace with HexaCore Classes."
        keywords="course library, free tech courses, learn web development, online tech education"
      />
      {/* Header Section */}
      <header className="py-16 bg-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 px-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <Badge className="bg-primary/20 text-primary border-primary/20 h-8 px-4 font-black uppercase tracking-widest text-[10px]">
            <Sparkles size={12} className="mr-2" />
            HexaCore Catalog
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Master New <span className="text-primary italic">Skills</span> Today
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg font-medium leading-relaxed">
              Explore our library of expert-led courses designed for the next generation of developers and tech enthusiasts.
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-0 space-y-16">
        {/* My Learning Section */}
        {user && (isLoading || enrolledPlaylists.length > 0) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <PlayCircle size={24} />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">My Learning</h2>
              </div>
              {!isLoading && (
                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl" onClick={() => navigate('/profile')}>
                  View Profile
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-[2.5rem] bg-slate-50" />)
              ) : (
                enrolledPlaylists.map(playlist => {
                  // Aggregated Progress Calculation:
                  // Count how many videos in this specific playlist the user has completed.
                  const playlistProgress = userProgress.filter(p => p.playlist_id === playlist.id);
                  const completedVideos = playlistProgress.filter(p => p.completed === 1).length;
                  const totalVideos = playlist.video_count || 1;
                  const progressPercentage = (completedVideos / totalVideos) * 100;

                  return (
                    <div key={playlist.id} className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                      <div className="flex gap-5">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                          <img
                            src={getAssetUrl(playlist.thumbnail_url)}
                            alt={playlist.title}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                          <h3 className="font-black text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">{playlist.title}</h3>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><BookOpen size={10} /> {playlist.video_count} Lectures</span>
                          </div>
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-primary">{Math.round(progressPercentage)}%</span>
                            </div>
                            <Progress value={progressPercentage} className="h-1.5 bg-slate-100" />
                          </div>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-6 h-12 rounded-2xl bg-slate-900 hover:bg-primary font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                      >
                        Continue Learning
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Discover Section */}
        <section className="space-y-8 pt-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Discover Courses</h2>
              <p className="text-slate-500 font-medium">Explore trending topics and find your next specialty.</p>
            </div>

            <div className="w-full md:max-w-md relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <Input
                placeholder="Search for courses, skills, or topics..."
                className="h-14 pl-12 pr-4 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-primary shadow-sm text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Advanced Filters Bar */}
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-2 text-slate-400">
                <Filter size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Filters:</span>
              </div>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-white text-slate-600 border border-slate-100 hover:border-primary/30"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto xl:ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 flex-1 xl:flex-none rounded-2xl border-slate-100 font-bold gap-3 px-6 hover:bg-slate-50">
                    <Layers size={18} className="text-primary" />
                    Level: {activeLevel}
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2 border-slate-50 rounded-2xl shadow-2xl min-w-[200px]">
                  {SKILL_LEVELS.map(level => (
                    <DropdownMenuItem
                      key={level}
                      onClick={() => setActiveLevel(level)}
                      className={`h-11 rounded-xl font-bold cursor-pointer ${activeLevel === level ? "bg-primary/5 text-primary" : "text-slate-600"}`}
                    >
                      {level}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 flex-1 xl:flex-none rounded-2xl border-slate-100 font-bold gap-3 px-6 hover:bg-slate-50">
                    <SlidersHorizontal size={18} className="text-primary" />
                    Sort: {sortBy}
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2 border-slate-50 rounded-2xl shadow-2xl min-w-[200px]">
                  {["Newest", "Popular"].map(option => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`h-11 rounded-xl font-bold cursor-pointer ${sortBy === option ? "bg-primary/5 text-primary" : "text-slate-600"}`}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Discover Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} className="h-[22rem] rounded-[2.5rem] bg-slate-50" />
              ))}
            </div>
          ) : filteredAndSortedDiscover.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAndSortedDiscover.map(playlist => (
                <CourseCard
                  key={playlist.id}
                  playlist={playlist}
                  subject={subjects.find(s => s.id === playlist.subject_id)}
                  isEnrolled={false}
                />
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary rotate-12 group-hover:rotate-0 transition-transform">
                <Search size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">No results found</h3>
                <p className="text-slate-500 max-w-sm font-medium">We couldn't find any courses matching your filters. Try adjusting your search query or categories.</p>
              </div>
              <Button
                variant="outline"
                className="h-12 px-8 rounded-2xl font-bold border-slate-200"
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
