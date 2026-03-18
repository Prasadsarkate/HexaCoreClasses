import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPDFById, getPlaylistPDFs } from '@/services/api';
import type { PDF } from '@/types/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, ChevronRight } from 'lucide-react';

export default function PDFReader() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { } = useAuth();

    const [pdf, setPdf] = useState<PDF | null>(null);
    const [playlistPdfs, setPlaylistPdfs] = useState<PDF[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadPDF();
        }
    }, [id]);

    const loadPDF = async () => {
        if (!id) return;

        setIsLoading(true);
        const pdfData = await getPDFById(id);

        if (pdfData) {
            setPdf(pdfData);

            // Load playlist PDFs
            if (pdfData.playlist_id) {
                const pdfs = await getPlaylistPDFs(pdfData.playlist_id);
                setPlaylistPdfs(pdfs);
            }
        }

        setIsLoading(false);
    };

    // Helper to convert Google Drive view URLs to preview URLs
    const getEmbedUrl = (originalUrl: string) => {
        if (!originalUrl) return '';
        try {
            if (originalUrl.includes('drive.google.com')) {
                let id = '';
                if (originalUrl.includes('/file/d/')) {
                    const parts = originalUrl.split('/file/d/');
                    if (parts.length > 1) {
                        id = parts[1].split('/')[0];
                    }
                } else if (originalUrl.includes('id=')) {
                    const params = new URLSearchParams(new URL(originalUrl).search);
                    id = params.get('id') || '';
                }

                if (id) {
                    return `https://drive.google.com/file/d/${id}/preview`;
                }
            }
            return originalUrl;
        } catch (e) {
            return originalUrl;
        }
    };

    // Helper to convert Google Drive view URLs to direct download URLs
    const getDirectDownloadUrl = (originalUrl: string) => {
        if (!originalUrl) return '';
        try {
            if (originalUrl.includes('drive.google.com')) {
                let id = '';
                if (originalUrl.includes('/file/d/')) {
                    const parts = originalUrl.split('/file/d/');
                    if (parts.length > 1) {
                        id = parts[1].split('/')[0];
                    }
                } else if (originalUrl.includes('id=')) {
                    const params = new URLSearchParams(new URL(originalUrl).search);
                    id = params.get('id') || '';
                }

                if (id) {
                    return `https://drive.google.com/uc?export=download&id=${id}`;
                }
            }
            return originalUrl;
        } catch (e) {
            return originalUrl;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading PDF...</p>
                </div>
            </div>
        );
    }

    if (!pdf) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">PDF not found</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    const embedUrl = getEmbedUrl(pdf.pdf_url);

    return (
        <div className="min-h-screen bg-background pb-0 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shrink-0">
                <div className="px-4 py-3 sm:px-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/playlist/${pdf.playlist_id}`)}
                        className="text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Playlist
                    </Button>
                    <h1 className="text-lg font-bold truncate">{pdf.title}</h1>
                </div>
            </div>

            {/* Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
                {/* Left: PDF Viewer (Main Content) */}
                <div className="flex-1 lg:w-3/4 bg-zinc-100 dark:bg-zinc-900 relative">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full border-0"
                        title={pdf.title}
                        allow="autoplay"
                    />
                    {/* Overlay to block Google Drive pop-out button */}
                    {pdf.pdf_url.includes('drive.google.com') && (
                        <div
                            className="absolute top-0 right-0 w-20 h-20 z-10 cursor-default"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                        />
                    )}
                </div>

                {/* Right: Details & Sidebar */}
                <div className="lg:w-1/4 bg-card border-l border-border flex flex-col w-full h-auto lg:h-full max-h-[45vh] lg:max-h-full overflow-hidden">
                    {/* Details Section */}
                    {/* On mobile, we hide title/desc to save space, but show download button */}
                    <div className="p-4 lg:p-6 border-b border-border shrink-0">
                        <h2 className="text-2xl font-bold mb-4 hidden lg:block">{pdf.title}</h2>
                        {pdf.description && (
                            <p className="text-muted-foreground mb-6 leading-relaxed hidden lg:block">
                                {pdf.description}
                            </p>
                        )}

                        {pdf.download_url && (
                            <Button
                                onClick={() => window.open(getDirectDownloadUrl(pdf.download_url || pdf.pdf_url), '_blank')}
                                className="w-full rounded-xl py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all mb-4 lg:mb-4 mb-0"
                            >
                                <Download className="mr-3" size={24} />
                                Download PDF
                            </Button>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 hidden lg:flex">
                            <FileText size={16} />
                            <span>Page {pdf.page_count ? pdf.page_count : 'N/A'}</span>
                        </div>
                    </div>

                    {/* Playlist Sidebar */}
                    {playlistPdfs.length > 1 && (
                        <div className="p-4 flex-1 overflow-y-auto">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                More in this playlist
                            </h3>
                            <div className="space-y-3">
                                {playlistPdfs.map((item, index) => (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(`/pdf/${item.id}`)}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group ${item.id === pdf.id
                                            ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.id === pdf.id ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className={`font-medium line-clamp-2 ${item.id === pdf.id ? 'text-primary' : 'group-hover:text-primary'
                                                }`}>
                                                {item.title}
                                            </h4>
                                        </div>
                                        {item.id === pdf.id && (
                                            <ChevronRight className="ml-auto text-primary shrink-0 self-center" size={16} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
