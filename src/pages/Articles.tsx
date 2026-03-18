import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, ChevronRight, Search, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getArticles, getAssetUrl } from '@/services/api';
import type { Article } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import PageMeta from '@/components/common/PageMeta';

export default function Articles() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setIsLoading(true);
        try {
            const data = await getArticles();
            setArticles(data || []);
        } catch (error) {
            console.error("Failed to load articles", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-24 space-y-12">
            <PageMeta
                title="Articles & Insights"
                description="Stay updated with the latest in technology, ethical hacking, and career advice. Explore expert-written articles and tutorials on HexaCore Classes."
                keywords="tech blog, ethical hacking tutorials, programming articles, HexaCore insights"
            />
            {/* Blog Header */}
            <header className="py-16 bg-slate-50 -mx-4 sm:-mx-6 lg:-mx-8 px-8 border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest leading-none">
                            <Sparkles size={14} />
                            <span>Knowledge Base</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Latest <span className="text-primary italic">Articles</span> & Insights
                        </h1>
                        <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">
                            Stay updated with top educational trends, expert technical tutorials, and career advice curated for your growth.
                        </p>
                    </div>

                    <div className="max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <Input
                            className="h-12 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-primary/20 transition-all placeholder:text-slate-400 font-medium"
                            placeholder="Search articles by title or topic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={i} className="overflow-hidden border-border/40 flex flex-col h-full bg-card rounded-3xl">
                                <Skeleton className="aspect-[16/10] w-full" />
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
                            </Card>
                        ))
                    ) : filteredArticles.map((article) => (
                        <Card key={article.id} className="group overflow-hidden border-border/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full bg-card rounded-3xl">
                            {/* Thumbnail */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                                <img
                                    src={getAssetUrl(article.thumbnail_url)}
                                    alt={article.title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 border-0 font-bold px-3 shadow-md">
                                    {article.category}
                                </Badge>
                            </div>

                            <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {format(new Date(article.created_at), 'MMM dd, yyyy')}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {article.read_time}</span>
                                    </div>
                                    <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {article.title}
                                    </h2>
                                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                                        {article.content?.substring(0, 150)}...
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-white overflow-hidden shadow-sm flex items-center justify-center">
                                            {article.author_avatar_url ? (
                                                <img
                                                    src={getAssetUrl(article.author_avatar_url)}
                                                    alt={article.author_name}
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={14} className="text-slate-400" />
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{article.author_name || "HexaCore Global"}</span>
                                    </div>
                                    <Button variant="ghost"
                                        onClick={() => navigate(`/articles/${article.id}`)}
                                        className="p-0 h-auto font-extrabold text-primary hover:bg-transparent group/btn">
                                        Read More <ChevronRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredArticles.length === 0 && (
                    <div className="text-center py-24 bg-slate-50 rounded-[3rem] space-y-4">
                        <BookOpen size={48} className="mx-auto text-slate-300" />
                        <h3 className="text-xl font-bold">No articles found</h3>
                        <p className="text-slate-500">Try searching for something else or browse our categories.</p>
                        <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl">Clear filters</Button>
                    </div>
                )}

                {/* Categories Section */}
                <div className="mt-20 py-16 bg-slate-950 -mx-4 sm:-mx-6 lg:-mx-8 px-8 rounded-[4rem] text-white">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl font-extrabold tracking-tight italic text-primary">Browse by Topic</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {["Development", "Design", "Cybersecurity", "Soft Skills", "Business", "Marketing"].map(topic => (
                                <Button key={topic} variant="outline" className="h-12 px-8 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                                    {topic}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
