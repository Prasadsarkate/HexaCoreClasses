import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Maximize2 } from 'lucide-react';

interface PDFViewerProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    downloadUrl?: string; // Added downloadUrl
    title: string;
}

export default function PDFViewer({ isOpen, onClose, url, downloadUrl, title }: PDFViewerProps) {
    // Helper to convert Google Drive view URLs to preview URLs
    const getEmbedUrl = (originalUrl: string) => {
        try {
            // Check if it's a Google Drive URL
            if (originalUrl.includes('drive.google.com')) {
                // Extract ID
                // Patterns: 
                // /file/d/ID/view
                // /open?id=ID

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

    const embedUrl = getEmbedUrl(url);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl w-[90vw] h-[85vh] p-0 border border-border bg-background shadow-2xl rounded-2xl sm:rounded-2xl overflow-hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 gap-0">
                {/* Header - Dark Theme for Immersive Feel */}
                <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-zinc-100 border-b border-zinc-800">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-1 bg-primary rounded-full shrink-0"></div>
                        <DialogTitle className="text-xl font-bold truncate text-zinc-100">
                            {title}
                        </DialogTitle>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Download Button */}
                        {downloadUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(downloadUrl, '_blank')}
                                className="hidden sm:flex rounded-full h-9 px-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white text-zinc-300"
                            >
                                <Download size={16} className="mr-2" strokeWidth={2} />
                                Download
                            </Button>
                        )}

                        {/* Open External (Optional, keeping as fallback but subtle) */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(url, '_blank')}
                            className="rounded-full h-9 w-9 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            title="Open in new tab"
                        >
                            <Maximize2 size={18} />
                        </Button>

                        {/* Close */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-10 w-10 rounded-full hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors"
                        >
                            <X size={24} />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full h-full bg-zinc-950 relative overflow-hidden">
                    {/* Mobile Download Button (Visible only on small screens) */}
                    {downloadUrl && (
                        <div className="sm:hidden absolute bottom-6 right-6 z-50">
                            <Button
                                variant="default"
                                size="icon"
                                onClick={() => window.open(downloadUrl, '_blank')}
                                className="rounded-full h-14 w-14 shadow-xl border-2 border-white/10"
                            >
                                <Download size={24} />
                            </Button>
                        </div>
                    )}

                    <iframe
                        src={embedUrl}
                        className="w-full h-full border-0 block"
                        allow="autoplay"
                        title={title}
                    />

                    {/* Overlay to block Google Drive pop-out button */}
                    {url.includes('drive.google.com') && (
                        <div
                            className="absolute top-0 right-0 w-20 h-20 z-10 cursor-default"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
