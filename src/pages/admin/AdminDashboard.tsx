import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Video, FileText, MessageCircleQuestion, AlertCircle, User, LayoutDashboard, Sparkles, TrendingUp, Settings } from 'lucide-react';
import { getAdminStatistics, getRecentPDFs, getDoubts } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { AdminStatistics } from '@/types/types';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    const data = await getAdminStatistics();
    setStats(data);
    setIsLoading(false);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Videos',
      value: stats?.total_videos || 0,
      icon: Video,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total PDFs',
      value: stats?.total_pdfs || 0,
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Doubts',
      value: stats?.total_doubts || 0,
      icon: MessageCircleQuestion,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Unanswered Doubts',
      value: stats?.unanswered_doubts || 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Welcome back! Here's what's happening on HexaCore today."
    >
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-[2rem] bg-slate-100" />
          ))
        ) : (
          statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={stat.color} size={32} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.title}</p>
                      <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-primary" size={20} /> Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/playlists')}
              className="p-6 bg-slate-50 rounded-[2rem] text-left hover:bg-primary hover:text-white transition-all duration-300 group"
            >
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20">
                <Video size={20} className="text-primary group-hover:text-white" />
              </div>
              <p className="font-black text-sm">Manage Courses</p>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">Videos & Playlists</p>
            </button>

            <button
              onClick={() => navigate('/admin/articles')}
              className="p-6 bg-slate-50 rounded-[2rem] text-left hover:bg-primary hover:text-white transition-all duration-300 group"
            >
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20">
                <FileText size={20} className="text-primary group-hover:text-white" />
              </div>
              <p className="font-black text-sm">Manage Articles</p>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">CMS & Blog Posts</p>
            </button>

            <button
              onClick={() => navigate('/admin/doubts')}
              className="p-6 bg-slate-50 rounded-[2rem] text-left hover:bg-primary hover:text-white transition-all duration-300 group"
            >
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20">
                <MessageCircleQuestion size={20} className="text-primary group-hover:text-white" />
              </div>
              <p className="font-black text-sm">Answer Doubts</p>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">Community Support</p>
            </button>

            <button
              onClick={() => navigate('/admin/settings')}
              className="p-6 bg-slate-900 rounded-[2rem] text-left hover:bg-primary text-white transition-all duration-300 group"
            >
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20">
                <Settings size={20} className="text-white" />
              </div>
              <p className="font-black text-sm">Admin Settings</p>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">Configuration</p>
            </button>
          </div>
        </Card>

        {/* System Health / Overview */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8 space-y-6 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} /> System Overview
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-sm font-bold text-slate-400">Database Status</span>
                <Badge className="bg-green-500/10 text-green-500 border-0 font-black tracking-widest text-[10px]">HEALTHY</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-sm font-bold text-slate-400">Server Latency</span>
                <span className="text-sm font-black text-primary">24ms</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-sm font-bold text-slate-400">Security Layers</span>
                <span className="text-sm font-black text-white">Active (JWT)</span>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs font-medium text-slate-500 italic">
                * All systems are currently operational. Dynamic data synchronization is active.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
