import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, BookOpen, Layout, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length > 1) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Explore', path: '/library' },
        { name: 'Community', path: '/community' },
        { name: 'Articles', path: '/articles' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <BookOpen className="text-primary-foreground w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline-block text-primary">
                            HexaCore <span className="text-foreground">Classes</span>
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md relative group">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                type="text"
                                placeholder="Search for courses, topics..."
                                className="w-full pl-10 pr-4 h-10 bg-muted/50 border-border focus:bg-background transition-all rounded-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </div>

                    {/* Nav Links - Desktop */}
                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth / Profile */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 border border-border overflow-hidden">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{profile?.full_name || 'Student'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/library')}>
                                        <Layout className="mr-2 h-4 w-4" />
                                        <span>My Dashboard</span>
                                    </DropdownMenuItem>
                                    {profile?.role === 'admin' && (
                                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            <span>Admin Panel</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Button variant="ghost" className="hidden sm:flex text-sm font-medium h-9 px-4" onClick={() => navigate('/login')}>
                                    Log in
                                </Button>
                                <Button className="text-[11px] sm:text-sm font-semibold h-9 px-4 sm:px-5 rounded-full shadow-lg hover:shadow-primary/20 transition-all" onClick={() => navigate('/login')}>
                                    Sign Up
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-9 w-9"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Search - Visible on small screens below md */}
                <div className="md:hidden pb-3 px-1">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search courses..."
                            className="w-full pl-9 h-9 bg-muted/30 border-transparent focus:bg-background rounded-full text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>
            </div>

            {/* Mobile Nav Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-x-0 top-[108px] bottom-0 z-[60] bg-background animate-in slide-in-from-top duration-300">
                    <div className="px-4 pt-4 pb-10 space-y-1 overflow-y-auto h-full">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-2">Main Menu</p>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold transition-all ${location.pathname === link.path
                                    ? 'bg-primary/10 text-primary shadow-sm'
                                    : 'text-foreground hover:bg-accent'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user && (
                            <div className="pt-6 mt-6 border-t border-border space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-2">Account</p>
                                <Link
                                    to="/profile"
                                    className="block px-4 py-4 rounded-xl text-base font-bold text-foreground hover:bg-accent"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    My Profile
                                </Link>
                                <button
                                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                                    className="block w-full text-left px-4 py-4 rounded-xl text-base font-bold text-destructive hover:bg-destructive/5"
                                >
                                    Log out
                                </button>
                            </div>
                        )}

                        {!user && (
                            <div className="pt-6 mt-6 border-t border-border p-3">
                                <Button className="w-full h-12 rounded-2xl font-bold text-lg" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                                    Join HexaCore Classes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
