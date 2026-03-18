import React from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    const { profile, loading } = useAuth();

    if (loading) return null;

    // Protect all admin routes
    if (!profile || profile.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="lg:ml-72 flex flex-col min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="px-8 py-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
                            {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900">{profile.full_name || profile.username}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500">
                                {(profile.username || 'A').slice(0, 1).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-8">
                    <div className="max-w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
