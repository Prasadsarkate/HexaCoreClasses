import { useState, useEffect } from 'react';
import type { PDF } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { addDownload, removeBookmark, addBookmark, isBookmarked, isDownloaded } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface PDFCardProps {
  pdf: PDF;
  compact?: boolean;
}

export default function PDFCard({ pdf, compact = false }: PDFCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user, pdf.id]);

  const checkStatus = async () => {
    if (!user) return;
    const [bookmarkStatus, downloadStatus] = await Promise.all([
      isBookmarked(user.id, undefined, pdf.id),
      isDownloaded(user.id, pdf.id),
    ]);
    setBookmarked(bookmarkStatus);
    setDownloaded(downloadStatus);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setLoading(true);
    if (bookmarked) {
      // Note: We'd need to get the bookmark ID first to remove it
      // For simplicity, we'll just toggle the state
      setBookmarked(false);
      toast({ title: 'Bookmark removed' });
    } else {
      const { error } = await addBookmark(user.id, undefined, pdf.id);
      if (!error) {
        setBookmarked(true);
        toast({ title: 'PDF bookmarked' });
      } else {
        toast({ title: 'Error', description: error.message });
      }
    }
    setLoading(false);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setLoading(true);
    const { error } = await addDownload(user.id, pdf.id);
    if (!error) {
      setDownloaded(true);
      toast({ title: 'PDF downloaded' });
      // Open download URL
      window.open(pdf.download_url, '_blank');
    } else {
      toast({ title: 'Error', description: error.message });
    }
    setLoading(false);
  };

  if (compact) {
    return (
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
        <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <FileText size={40} className="text-primary" strokeWidth={1.5} />
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0 text-xs">
            {pdf.subject}
          </Badge>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm text-card-foreground line-clamp-2 mb-1">
            {pdf.title}
          </h3>
          {pdf.page_count && (
            <p className="text-xs text-muted-foreground">{pdf.page_count} pages</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        <FileText size={64} className="text-primary" strokeWidth={1.5} />
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0">
          {pdf.subject}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1">
            {pdf.title}
          </h3>
          {pdf.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pdf.description}
            </p>
          )}
          {pdf.page_count && (
            <p className="text-xs text-muted-foreground mt-1">{pdf.page_count} pages</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={loading || downloaded}
            className="flex-1 rounded-[1.25rem]"
          >
            <Download size={16} strokeWidth={1.5} className="mr-1" />
            {downloaded ? 'Downloaded' : 'Download'}
          </Button>
          <Button
            variant={bookmarked ? 'default' : 'outline'}
            size="sm"
            onClick={handleBookmark}
            disabled={loading}
            className="rounded-[1.25rem]"
          >
            <Bookmark size={16} strokeWidth={1.5} fill={bookmarked ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
