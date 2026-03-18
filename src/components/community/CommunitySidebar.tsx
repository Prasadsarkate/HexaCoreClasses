import { Hash, Users, MessageSquare, Award, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCommunityStats, getAssetUrl } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

const CHANNELS = [
    { id: 'general', name: 'General', icon: MessageSquare },
    { id: 'web-dev', name: 'Web-Development', icon: Hash },
    { id: 'cyber', name: 'Cyber-Security', icon: Hash },
    { id: 'showcase', name: 'Project-Showcase', icon: Award },
];

interface CommunitySidebarProps {
    activeChannel: string;
    onChannelChange: (id: string) => void;
}

export default function CommunitySidebar({ activeChannel, onChannelChange }: CommunitySidebarProps) {
    const [stats, setStats] = useState<{ channels: Record<string, number>, contributors: any[] } | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getCommunityStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load community stats", error);
            }
        };
        loadStats();
    }, []);

    return (
        <aside className="w-full space-y-8 sticky top-24">
            {/* Channels Navigation */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                    <Users size={14} className="text-primary" /> Discussion Channels
                </h3>
                <nav className="space-y-1.5">
                    {CHANNELS.map((channel) => (
                        <button
                            key={channel.id}
                            onClick={() => onChannelChange(channel.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${activeChannel === channel.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                                }`}
                        >
                            <channel.icon size={18} className={activeChannel === channel.id ? "animate-pulse" : ""} />
                            {channel.name}
                            {(stats?.channels[channel.id] || 0) > 0 && (
                                <Badge className={`ml-auto border-0 text-[10px] h-5 ${activeChannel === channel.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                    }`}>{stats?.channels[channel.id]}</Badge>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Top Contributors */}
            <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2 relative z-10 flex items-center gap-2">
                    <Award size={14} className="text-primary" /> Top Contributors
                </h3>

                <div className="space-y-6 relative z-10">
                    {stats?.contributors.map((user, idx) => (
                        <div key={user.id} className="flex items-center gap-3 group">
                            <div className="relative">
                                <Avatar className="w-10 h-10 rounded-xl border border-slate-700 transition-transform group-hover:scale-110">
                                    <AvatarImage src={getAssetUrl(user.avatar_url ?? undefined)} alt={user.username} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                        {(user.username || 'U').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-slate-900 shadow-lg z-10">
                                    {user.badge}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors text-slate-200">{user.username}</p>
                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-tighter">{user.points} Contribution Points</p>
                            </div>
                        </div>
                    ))}
                    {(!stats || stats.contributors.length === 0) && (
                        <p className="text-center text-[10px] text-slate-500 font-bold uppercase py-4">No data yet</p>
                    )}
                </div>

                <Button variant="ghost" className="w-full mt-6 rounded-xl border border-slate-800 text-xs font-bold hover:bg-slate-800 hover:text-white">
                    <UserPlus size={14} className="mr-2" /> View Leaderboard
                </Button>
            </div>
        </aside>
    );
}
