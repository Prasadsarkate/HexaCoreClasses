import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, User, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Playlist, Subject } from '@/types/types';

interface CourseCardProps {
    playlist: Playlist;
    subject?: Subject;
    isEnrolled?: boolean;
}

export default function CourseCard({ playlist, subject, isEnrolled }: CourseCardProps) {
    const navigate = useNavigate();

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    return (
        <Card
            className="group relative flex flex-col h-full bg-card overflow-hidden border-border/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer rounded-2xl"
            onClick={() => navigate(`/playlist/${playlist.id}`)}
        >
            {/* Thumbnail Container */}
            <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img
                    src={playlist.thumbnail_url}
                    alt={playlist.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Enrolled Badge Overlay */}
                {isEnrolled && (
                    <div className="absolute top-3 right-3 z-20">
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg px-2 py-0.5 flex items-center gap-1">
                            <CheckCircle size={10} strokeWidth={3} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Enrolled</span>
                        </Badge>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                {subject && (
                    <Badge
                        className="absolute top-3 left-3 shadow-md border-0 text-[10px] sm:text-xs font-bold backdrop-blur-md px-2 py-0.5"
                        style={{ backgroundColor: `${subject.color}CC`, color: '#fff' }}
                    >
                        {subject.name}
                    </Badge>
                )}
// ... existing play icon ...

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border border-white/30">
                        <PlayCircle className="text-white w-8 h-8" fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                <div className="space-y-1.5">
                    <h3 className="font-bold text-[13px] sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {playlist.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] sm:text-xs font-medium">
                        <User size={12} className="text-muted-foreground" />
                        <span>HexaCore Expert</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                        <div className="flex items-center gap-1">
                            <Award size={12} className="text-yellow-500" />
                            <span>Top Rated</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <div className="flex items-center gap-3 text-[10px] sm:text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            <PlayCircle size={12} className="text-primary" />
                            <span>{playlist.video_count} Videos</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            <Clock size={12} className="text-primary" />
                            <span>{formatDuration(playlist.total_duration)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Footer / CTA */}
            <div className="px-4 pb-4 mt-auto">
                <Button
                    className="w-full h-9 rounded-xl font-bold text-xs bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-0 transition-all shadow-none group-hover:shadow-lg group-hover:shadow-primary/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/playlist/${playlist.id}`);
                    }}
                >
                    {isEnrolled ? "Go to Course" : "Enroll This Course"}
                </Button>
            </div>
        </Card>
    );
}
