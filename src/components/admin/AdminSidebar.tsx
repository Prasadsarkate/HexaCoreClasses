import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    FileText,
    Settings,
    Menu,
    X,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Courses', path: '/admin/playlists', icon: BookOpen },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Articles', path: '/admin/articles', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md rounded-xl"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 bottom-0 z-40 w-72 bg-slate-900 text-white transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full p-8">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-primary p-2 rounded-xl">
                            <BookOpen className="text-white w-6 h-6" />
                        </div>
                        <span className="font-black text-xl tracking-tight">
                            HexaCore <span className="text-primary italic">Admin</span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-4">Menu</p>
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 group
                    ${isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }
                  `}
                                >
                                    <item.icon size={20} className={isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform"} />
                                    <span className="flex-1 text-left">{item.name}</span>
                                    {isActive && <ChevronRight size={16} />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="pt-8 border-t border-white/5 mt-auto">
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all group"
                        >
                            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
