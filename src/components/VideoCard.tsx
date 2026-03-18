import type { Video } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  featured?: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video, featured = false }: VideoCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group",
        featured ? "glass-card" : "bg-card"
      )}
    >
      <div className="relative">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Play size={24} className="text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground border-0">
          {video.subject}
        </Badge>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
          <Clock size={12} strokeWidth={1.5} />
          {formatDuration(video.duration)}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1">
          {video.title}
        </h3>
        {video.description && !video.description.includes('Part of imported playlist') && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
