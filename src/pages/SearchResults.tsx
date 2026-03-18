import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchContent } from '@/services/api';
import type { Video, Playlist, PDF } from '@/types/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, PlayCircle, BookOpen, FileText, ArrowLeft } from 'lucide-react';

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);
    const [results, setResults] = useState<{ videos: Video[], playlists: Playlist[], pdfs: PDF[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length >= 2) {
            handleSearch(query);
        }
    }, [query]);

    const handleSearch = async (q: string) => {
        setIsLoading(true);
        try {
            const data = await searchContent(q);
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchParams({ q: inputValue });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 sticky top-0 z-10 shadow-md">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-white/20">
                        <ArrowLeft />
                    </Button>
                    <form onSubmit={onSearchSubmit} className="flex-1 relative">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Search anything..."
                            className="bg-white/95 border-0 rounded-full pl-10 h-11 shadow-lg text-black"
                        />
                        <Search className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : !results ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Type to search videos, courses, and notes</p>
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6 sticky top-[76px] z-10 bg-background/95 backdrop-blur shadow-sm rounded-lg p-1">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="videos">Videos ({results.videos.length})</TabsTrigger>
                            <TabsTrigger value="courses">Courses ({results.playlists.length})</TabsTrigger>
                            <TabsTrigger value="pdfs">PDFs ({results.pdfs.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-8">
                            {/* Videos Section */}
                            {results.videos.length > 0 && (
                                <section>
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <PlayCircle size={20} className="text-primary" /> Videos
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.videos.slice(0, 3).map(video => (
                                            <SearchVideoCard key={video.id} video={video} navigate={navigate} />
                                        ))}
                                    </div>
                                    {results.videos.length > 3 && (
                                        <Button variant="link" onClick={() => document.getElementById('tab-videos')?.click()} className="mt-2 pl-0">View all videos</Button>
                                    )}
                                </section>
                            )}

                            {/* Playlists Section */}
                            {results.playlists.length > 0 && (
                                <section>
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <BookOpen size={20} className="text-primary" /> Courses
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.playlists.slice(0, 3).map(playlist => (
                                            <SearchPlaylistCard key={playlist.id} playlist={playlist} navigate={navigate} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* PDFs Section */}
                            {results.pdfs.length > 0 && (
                                <section>
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <FileText size={20} className="text-primary" /> Notes & PDFs
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {results.pdfs.slice(0, 4).map(pdf => (
                                            <div key={pdf.id} onClick={() => navigate(`/pdf/${pdf.id}`)} className="flex items-center gap-3 p-3 bg-card rounded-lg border cursor-pointer hover:shadow-md transition-all">
                                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                                                    <FileText className="text-red-500" size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium line-clamp-1">{pdf.title}</h4>
                                                    <p className="text-xs text-muted-foreground">PDF Document</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </TabsContent>

                        <TabsContent value="videos">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.videos.map(video => (
                                    <SearchVideoCard key={video.id} video={video} navigate={navigate} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="courses">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.playlists.map(playlist => (
                                    <SearchPlaylistCard key={playlist.id} playlist={playlist} navigate={navigate} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="pdfs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.pdfs.map(pdf => (
                                    <div key={pdf.id} onClick={() => navigate(`/pdf/${pdf.id}`)} className="flex items-center gap-3 p-3 bg-card rounded-lg border cursor-pointer hover:shadow-md transition-all">
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="text-red-500" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium line-clamp-1">{pdf.title}</h4>
                                            <p className="text-xs text-muted-foreground mb-1">Click to read</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                    </Tabs>
                )}
            </div>
        </div>
    );
}

function SearchVideoCard({ video, navigate }: { video: Video, navigate: any }) {
    return (
        <div onClick={() => navigate(`/video/${video.id}?autoplay=true`)} className="group cursor-pointer">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-2">
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">{Math.floor(video.duration / 60)}m</div>
            </div>
            <h4 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary">{video.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">Video</p>
        </div>
    );
}

function SearchPlaylistCard({ playlist, navigate }: { playlist: Playlist, navigate: any }) {
    return (
        <div onClick={() => navigate(`/playlist/${playlist.id}`)} className="group cursor-pointer p-3 rounded-xl border bg-card hover:shadow-lg transition-all">
            <div className="flex gap-3">
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img src={playlist.thumbnail_url} alt={playlist.title} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-primary">{playlist.title}</h4>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                        <span className="bg-secondary px-1.5 py-0.5 rounded">{playlist.video_count} videos</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
