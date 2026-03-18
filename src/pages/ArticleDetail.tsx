import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronLeft, Share2, Bookmark, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getArticleById, getAssetUrl } from '@/services/api';
import type { Article } from '@/types/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import PageMeta from '@/components/common/PageMeta';

export default function ArticleDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadArticle(id);
        }
    }, [id]);

    const loadArticle = async (articleId: string) => {
        setIsLoading(true);
        try {
            const data = await getArticleById(articleId);
            setArticle(data);
        } catch (error) {
            console.error("Failed to load article", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-500">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-12 w-full" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="aspect-video w-full rounded-[2.5rem]" />
                <div className="space-y-4 pt-8">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-black text-slate-900">Article not found</h2>
                <Button onClick={() => navigate('/articles')} variant="outline" className="rounded-xl">
                    Back to Knowledge Base
                </Button>
            </div>
        );
    }

    const renderMarkdown = (content: string) => {
        if (!content) return '';

        // Simple markdown to HTML converter
        let html = content
            // Headers
            .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-black mt-8 mb-4">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-black mt-6 mb-3 text-slate-900">$2</h2>')
            .replace(/^### (.*$)/gm, '<h3 class="text-xl font-black mt-5 mb-2 text-slate-900">$3</h3>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Blockquotes
            .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary/30 pl-6 py-2 my-6 italic text-slate-500 bg-slate-50/50 rounded-r-2xl">$1</blockquote>')
            // Lists (Unordered)
            .replace(/^\s*[-*+] (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-6 rounded-[2rem] my-6 overflow-x-auto font-mono text-sm border border-white/10 shadow-2xl"><code>$1</code></pre>')
            // Inline code
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-primary px-1.5 py-0.5 rounded-md font-mono text-xs font-bold">$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer">$1</a>')
            // Images
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-[2.5rem] my-8 shadow-xl border border-slate-100 w-full" />');

        // Wrap consecutive <li> into <ul>
        html = html.replace(/(<li.*<\/li>)/g, '<ul class="list-disc my-6 space-y-2">$1</ul>');

        // Final paragraph cleanup (wrap lines that aren't tags)
        const lines = html.split('\n');
        const processedLines = lines.map(line => {
            if (line.trim() === '') return '<br/>';
            if (line.startsWith('<')) return line;
            return `<p class="text-slate-600 leading-[1.8] mb-6">${line}</p>`;
        });

        return processedLines.join('\n');
    };

    return (
        <div className="min-h-screen pb-24 bg-white">
            <PageMeta
                title={article.title}
                description={article.content ? article.content.substring(0, 160).replace(/[#*]/g, '') + '...' : ""}
                ogImage={getAssetUrl(article.thumbnail_url) || ""}
                keywords={`${article.category}, ${article.title.split(' ').join(', ')}, HexaCore Classes`}
                ogType="article"
            />
            {/* Navigation & Header */}
            <div className="max-w-4xl mx-auto px-4 pt-12">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/articles')}
                    className="mb-12 hover:bg-slate-50 rounded-2xl gap-2 font-bold text-slate-400 group h-12"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Knowledge Base
                </Button>

                <div className="space-y-8">
                    <Badge className="bg-primary/5 text-primary border-0 font-black uppercase tracking-[0.2em] px-5 h-8 text-[10px] rounded-full">
                        {article.category}
                    </Badge>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.05]">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-8 pt-6 border-b border-slate-100 pb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center">
                                {article.author_avatar_url ? (
                                    <img
                                        src={getAssetUrl(article.author_avatar_url)}
                                        alt={article.author_name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={20} className="text-slate-300" />
                                )}
                            </div>
                            <div>
                                <p className="text-base font-black text-slate-900 tracking-tight">{article.author_name || "HexaCore Global"}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {article.author_name ? "Verified Author" : "Editorial Team"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-l border-slate-100 pl-8">
                            <span className="flex items-center gap-2"><Calendar size={14} className="text-primary/40" /> {format(new Date(article.created_at), 'MMM dd, yyyy')}</span>
                            <span className="flex items-center gap-2"><Clock size={14} className="text-primary/40" /> {article.read_time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            <div className="max-w-5xl mx-auto px-4 lg:px-0 py-12">
                <div className="aspect-[21/9] w-full rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 bg-slate-50 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                        src={getAssetUrl(article.thumbnail_url)}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s]"
                    />
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Share & Actions Sidebar */}
                    <div className="lg:w-16 flex lg:flex-col items-center gap-4 sticky top-32 h-fit order-2 lg:order-1">
                        <Button variant="outline" size="icon" className="w-14 h-14 rounded-[1.25rem] border-slate-100 shadow-sm hover:border-primary/30 hover:text-primary hover:shadow-xl hover:shadow-primary/5 transition-all bg-white">
                            <Share2 size={22} />
                        </Button>
                        <Button variant="outline" size="icon" className="w-14 h-14 rounded-[1.25rem] border-slate-100 shadow-sm hover:border-primary/30 hover:text-primary hover:shadow-xl hover:shadow-primary/5 transition-all bg-white">
                            <Bookmark size={22} />
                        </Button>
                        <Button variant="outline" size="icon" className="w-14 h-14 rounded-[1.25rem] border-slate-100 shadow-sm hover:border-primary/30 hover:text-primary hover:shadow-xl hover:shadow-primary/5 transition-all bg-white">
                            <MessageCircle size={22} />
                        </Button>
                    </div>

                    {/* Body Text */}
                    <div className="flex-1 order-1 lg:order-2">
                        <div
                            className="article-content prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-[1.8] prose-strong:text-slate-900 prose-img:rounded-[2.5rem] prose-a:text-primary prose-a:no-underline hover:prose-a:underline font-medium"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content || '') }}
                        />

                        {article.tags && (
                            <div className="pt-20 mt-20 border-t border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6 italic">Discovery Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.split(',').map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-400 border-slate-100/50 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all cursor-pointer font-bold px-6 py-2 rounded-xl text-[11px]">
                                            #{tag.trim().toLowerCase()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </article>

            {/* Newsletter CTA */}
            <div className="max-w-3xl mx-auto px-4 mt-12 text-center py-10 bg-slate-950 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-30" />
                <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-black">Enjoyed this article?</h3>
                    <p className="text-slate-400 text-sm font-medium px-4">Subscribe to our newsletter for weekly educational insights.</p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-2">
                        <input className="h-11 bg-white/5 border border-white/10 rounded-xl px-5 text-sm flex-1 focus:outline-none focus:border-primary transition-colors" placeholder="Enter your email" />
                        <Button className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] px-6">Subscribe</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
