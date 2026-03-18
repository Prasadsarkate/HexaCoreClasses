import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    FilePlus,
    Image as ImageIcon,
    Type,
    Hash,
    Layers,
    Tag,
    Bold,
    Italic,
    Heading1,
    Heading2,
    Link as LinkIcon,
    Quote,
    Code,
    CloudUpload,
    Calendar,
    CheckCircle2,
    Clock,
    Loader2
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getArticles, createArticle, updateArticle, deleteArticle, getAssetUrl } from '@/services/api';
import type { Article } from '@/types/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = ["Programming", "Cyber Security", "Tech News", "Career", "Design", "Business"];
const ARTICLE_GAS_URL = "https://script.google.com/macros/s/AKfycbzsAKDApBKA7hBqtJvbfOkUNnwAGJ7wv_zPX34mjDqye-Yg7NYNnVlg-UuK108Q6dPbtA/exec";

export default function AdminArticles() {
    const { toast } = useToast();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all-articles");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: '',
        tags: '',
        thumbnail_url: '',
        content: '',
        read_time: '5 min read'
    });

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

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title)
        });
    };

    const handleEdit = (article: Article) => {
        setEditingId(article.id);
        setFormData({
            title: article.title,
            slug: article.slug,
            category: article.category,
            tags: article.tags || '',
            thumbnail_url: article.thumbnail_url || '',
            content: article.content || '',
            read_time: article.read_time || '5 min read'
        });
        setActiveTab("create-article");
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: '',
            slug: '',
            category: '',
            tags: '',
            thumbnail_url: '',
            content: '',
            read_time: '5 min read'
        });
    };

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!formData.title || !formData.category) {
            toast({
                title: "Error",
                description: "Please fill in the article title and category.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        let result;
        if (editingId) {
            result = await updateArticle(editingId, { ...formData, status });
        } else {
            result = await createArticle({ ...formData, status });
        }

        setIsSubmitting(false);

        if (result.error) {
            toast({
                title: "Error",
                description: editingId ? "Failed to update article." : "Failed to create article.",
                variant: "destructive"
            });
        } else {
            toast({
                title: editingId ? "Article Updated" : (status === 'published' ? "Article Published" : "Draft Saved"),
                description: editingId ? "Your changes have been saved." : "Your article has been successfully created."
            });
            resetForm();
            setActiveTab("all-articles");
            loadArticles();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;

        const { error } = await deleteArticle(id);
        if (error) {
            toast({ title: "Error", description: "Failed to delete article", variant: "destructive" });
        } else {
            toast({ title: "Deleted", description: "Article removed successfully" });
            loadArticles();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast({ title: "Error", description: "File size must be less than 2MB", variant: "destructive" });
            return;
        }

        setIsUploadingImage(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result?.toString().split(',')[1];
            const payload = {
                base64: base64,
                mimeType: file.type,
                filename: `article_${Date.now()}`
            };

            try {
                const response = await fetch(ARTICLE_GAS_URL, {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: { "Content-Type": "text/plain" },
                });

                const result = await response.json();

                if (result.result === "success") {
                    setFormData(prev => ({ ...prev, thumbnail_url: result.url }));
                    toast({ title: "Success", description: "Image uploaded to Drive" });
                } else {
                    throw new Error(result.message || "Upload failed");
                }
            } catch (error) {
                console.error("Upload error:", error);
                toast({
                    title: "Error",
                    description: "Failed to upload to Google Drive. Check script permissions.",
                    variant: "destructive"
                });
            } finally {
                setIsUploadingImage(false);
            }
        };
    };

    const insertMarkdown = (type: string) => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        // Use functional state update to ensure we have latest content
        setFormData(prev => {
            const text = prev.content;
            const selectedText = text.substring(start, end);

            let replacement = '';
            let cursorOffset = 0;

            switch (type) {
                case 'bold': replacement = `**${selectedText || 'bold text'}**`; cursorOffset = 2; break;
                case 'italic': replacement = `*${selectedText || 'italic text'}*`; cursorOffset = 1; break;
                case 'h1': replacement = `\n# ${selectedText || 'Heading 1'}\n`; break;
                case 'h2': replacement = `\n## ${selectedText || 'Heading 2'}\n`; break;
                case 'link': replacement = `[${selectedText || 'link text'}](https://)`; break;
                case 'image': replacement = `![${selectedText || 'alt text'}](https://)`; break;
                case 'quote': replacement = `\n> ${selectedText || 'quote'}\n`; break;
                case 'code': replacement = `\n\`\`\`\n${selectedText || 'code'}\n\`\`\`\n`; break;
                default: return prev;
            }

            const newContent = text.substring(0, start) + replacement + text.substring(end);

            // Refocus and set selection range after a brief delay to allow React to render
            setTimeout(() => {
                textarea.focus();
                if (!selectedText) {
                    textarea.setSelectionRange(start + cursorOffset, start + replacement.length - cursorOffset);
                } else {
                    textarea.setSelectionRange(start, start + replacement.length);
                }
            }, 50);

            return { ...prev, content: newContent };
        });
    };

    return (
        <AdminLayout
            title="Article Management"
            subtitle="Create, edit, and manage your platform's editorial content"
        >
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === 'all-articles') resetForm(); }} className="space-y-8">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-white border p-1 rounded-2xl h-12 shadow-sm">
                        <TabsTrigger value="all-articles" className="rounded-xl px-6 font-bold flex items-center gap-2">
                            <Layers size={16} /> All Articles
                        </TabsTrigger>
                        <TabsTrigger value="create-article" className="rounded-xl px-6 font-bold flex items-center gap-2">
                            <Plus size={16} /> {editingId ? 'Edit Article' : 'Create New'}
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === 'all-articles' && (
                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    placeholder="Search articles..."
                                    className="pl-10 h-11 rounded-xl bg-white border-slate-200 shadow-sm"
                                />
                            </div>
                            <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold gap-2 bg-white shadow-sm">
                                <Filter size={18} /> Filter
                            </Button>
                        </div>
                    )}

                    {editingId && activeTab === 'create-article' && (
                        <Button variant="ghost" className="rounded-xl font-bold text-slate-400" onClick={resetForm}>
                            Cancel Editing
                        </Button>
                    )}
                </div>

                {/* View 1: Articles Table */}
                <TabsContent value="all-articles" className="animate-in fade-in duration-500">
                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                            <Table className="min-w-[1000px]">
                                <TableHeader className="bg-slate-900 text-white">
                                    <TableRow className="hover:bg-slate-900 border-0 h-14">
                                        <TableHead className="rounded-tl-[2.5rem] text-white font-black uppercase tracking-widest text-[10px] pl-8">Thumbnail</TableHead>
                                        <TableHead className="text-white font-black uppercase tracking-widest text-[10px]">Article Title</TableHead>
                                        <TableHead className="text-white font-black uppercase tracking-widest text-[10px]">Category</TableHead>
                                        <TableHead className="text-white font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                                        <TableHead className="text-white font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                                        <TableHead className="rounded-tr-[2.5rem] text-right text-white font-black uppercase tracking-widest text-[10px] pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <TableRow key={i}>
                                                <TableCell className="pl-8"><Skeleton className="w-16 h-12 rounded-lg" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                                <TableCell className="text-right pr-8"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : articles.length > 0 ? (
                                        articles.map((article) => (
                                            <TableRow key={article.id} className="h-20 hover:bg-slate-50 transition-colors">
                                                <TableCell className="pl-8">
                                                    <div className="w-20 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                                                        <img src={getAssetUrl(article.thumbnail_url)} className="w-full h-full object-cover" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-black text-slate-800 text-base">{article.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-0 font-bold px-3">
                                                        {article.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-400 font-bold text-sm">
                                                    {format(new Date(article.created_at), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-0 font-black tracking-widest uppercase text-[9px] h-7 px-3 rounded-lg shadow-sm">
                                                        Published
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100 w-11 h-11">
                                                                <MoreHorizontal size={22} className="text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-0 shadow-2xl min-w-[180px]">
                                                            <DropdownMenuItem onClick={() => handleEdit(article)} className="rounded-xl font-bold cursor-pointer gap-3 h-12">
                                                                <Edit size={18} className="text-slate-400" /> Edit Article
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => window.open(`/articles/${article.id}`, '_blank')} className="rounded-xl font-bold cursor-pointer gap-3 h-12 text-primary focus:text-primary">
                                                                <Eye size={18} /> View Live
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(article.id)}
                                                                className="rounded-xl font-bold cursor-pointer gap-3 h-12 text-red-500 focus:text-red-500 focus:bg-red-50"
                                                            >
                                                                <Trash2 size={18} /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                                    <FilePlus size={48} />
                                                    <p className="font-extrabold text-xl font-black">No articles found</p>
                                                    <Button variant="link" className="font-bold underline" onClick={() => setActiveTab("create-article")}>Create your first article</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                {/* View 2: Create Article Form */}
                <TabsContent value="create-article" className="animate-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                        {/* Main Form Area */}
                        <div className="xl:col-span-2 space-y-8">
                            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] sm:rounded-[3rem] p-5 sm:p-10 space-y-6 sm:space-y-10 bg-white">
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Article Title *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Enter a catchy headline..."
                                            className="h-14 sm:h-16 rounded-2xl sm:rounded-[1.5rem] border-slate-50 bg-slate-50/50 focus:bg-white text-lg sm:text-xl font-black transition-all"
                                            value={formData.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Permanent Link (URL)</Label>
                                        <div className="flex shadow-sm rounded-2xl sm:rounded-[1.25rem] overflow-hidden border border-slate-50">
                                            <div className="hidden sm:flex bg-slate-50 border-r border-slate-100 h-10 sm:h-12 items-center px-4 sm:px-5 text-[10px] sm:text-[11px] font-black text-slate-400 tracking-tighter shrink-0">
                                                hexacoreclasses.in/articles/
                                            </div>
                                            <Input
                                                id="slug"
                                                className="h-12 border-0 rounded-none bg-white text-xs font-black text-primary focus-visible:ring-0"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Content Editor</Label>
                                    {/* Rich Text Editor Placeholder */}
                                    <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                                        <div className="bg-white border-b border-slate-100 p-3 flex flex-wrap gap-2 sticky top-0 z-10">
                                            {[
                                                { icon: Bold, type: 'bold', label: 'Bold' },
                                                { icon: Italic, type: 'italic', label: 'Italic' },
                                                { icon: Heading1, type: 'h1', label: 'H1' },
                                                { icon: Heading2, type: 'h2', label: 'H2' },
                                                { icon: LinkIcon, type: 'link', label: 'Link' },
                                                { icon: ImageIcon, type: 'image', label: 'Image' },
                                                { icon: Quote, type: 'quote', label: 'Quote' },
                                                { icon: Code, type: 'code', label: 'Code' }
                                            ].map((btn, i) => (
                                                <Button
                                                    key={i}
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => insertMarkdown(btn.type)}
                                                    className="h-11 w-11 rounded-1.5xl hover:bg-slate-50 hover:text-primary transition-all group"
                                                >
                                                    <btn.icon size={20} className="group-hover:scale-110 transition-transform" />
                                                </Button>
                                            ))}
                                        </div>
                                        <Textarea
                                            ref={contentRef}
                                            placeholder="Start writing your story..."
                                            className="min-h-[400px] sm:min-h-[550px] border-0 focus-visible:ring-0 rounded-none bg-white p-5 sm:p-10 text-base sm:text-lg leading-[1.8] font-medium text-slate-600"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar / Publishing Settings */}
                        <div className="space-y-8">
                            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8 space-y-8 bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <div className="space-y-6 relative z-10">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">Publishing Settings</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category *</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                                            >
                                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-0 shadow-2xl p-2">
                                                    {CATEGORIES.map(cat => (
                                                        <SelectItem key={cat} value={cat} className="rounded-xl font-bold">{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tags</Label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                                <Input
                                                    placeholder="react, tutorial, tech..."
                                                    className="h-12 bg-white/5 border-white/10 rounded-2xl text-white pl-10 placeholder:text-slate-600 font-bold"
                                                    value={formData.tags}
                                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                                            onClick={() => handleSubmit('published')}
                                            disabled={isSubmitting}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            {isSubmitting ? "Publishing..." : "Publish Article"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 rounded-2xl bg-transparent border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                                            onClick={() => handleSubmit('draft')}
                                            disabled={isSubmitting}
                                        >
                                            <Clock className="mr-2 h-4 w-4" /> Save as Draft
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            {/* Thumbnail Upload Card */}
                            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8 space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured Thumbnail</Label>

                                {formData.thumbnail_url ? (
                                    <div className="relative rounded-2xl overflow-hidden aspect-video group">
                                        <img src={getAssetUrl(formData.thumbnail_url)} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-xl font-bold"
                                                    onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                                                >
                                                    Change Image
                                                </Button>
                                                <a
                                                    href={formData.thumbnail_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold text-white/70 hover:text-white underline text-center"
                                                >
                                                    View on Drive (Verify Permissions)
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="img-upload"
                                        className="border-2 border-dashed border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/30 transition-all cursor-pointer bg-slate-50/50 w-full"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                                            {isUploadingImage ? <Loader2 className="animate-spin" size={32} /> : <CloudUpload size={32} />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-extrabold text-sm text-slate-900">
                                                {isUploadingImage ? "Saving to Drive..." : "Upload Image"}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">JPG, PNG or GIF (1200x630)</p>
                                        </div>
                                        <Input
                                            className="sr-only"
                                            id="img-upload"
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        {!isUploadingImage && (
                                            <div
                                                className="rounded-xl h-10 px-6 font-bold text-xs border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
                                            >
                                                Browse Files
                                            </div>
                                        )}
                                    </label>
                                )}
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
}
