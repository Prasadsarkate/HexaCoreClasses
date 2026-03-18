import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin, Facebook, Mail, Globe } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-8">
                    {/* Brand & Tagline */}
                    <div className="flex flex-col items-center lg:items-start gap-3">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <BookOpen className="text-primary-foreground w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">
                                HexaCore <span className="text-primary">Classes</span>
                            </span>
                        </Link>
                        <p className="text-xs text-slate-500 max-w-xs text-center lg:text-left leading-relaxed">
                            Premium educational resources for the next generation of creators and engineers.
                        </p>
                    </div>

                    {/* Compact Links Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 text-center sm:text-left">
                        <div className="space-y-2">
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Platform</h4>
                            <ul className="flex flex-col gap-1.5 text-[13px]">
                                <li><Link to="/library" className="hover:text-primary transition-colors">Courses</Link></li>
                                <li><Link to="/community" className="hover:text-primary transition-colors">Community</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Company</h4>
                            <ul className="flex flex-col gap-1.5 text-[13px]">
                                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                <li><Link to="/credits" className="hover:text-primary transition-colors">Partners</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Legal</h4>
                            <ul className="flex flex-col gap-1.5 text-[13px]">
                                <li><Link to="/legal" className="hover:text-primary transition-colors">Privacy & Terms</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Social & Contact info */}
                    <div className="flex flex-col items-center lg:items-end gap-3">
                        <div className="flex items-center gap-3">
                            <a href="#" className="hover:text-white transition-colors p-2 rounded-full bg-slate-900 border border-slate-800"><Twitter size={16} /></a>
                            <a href="#" className="hover:text-white transition-colors p-2 rounded-full bg-slate-900 border border-slate-800"><Linkedin size={16} /></a>
                            <a href="#" className="hover:text-white transition-colors p-2 rounded-full bg-slate-900 border border-slate-800"><Github size={16} /></a>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5"><Globe size={14} className="text-slate-600" /> English (US)</span>
                            <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-600" /> support@hexacoreclasses.in</span>
                            <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-600" /> help@hexacoreclasses.in</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600 font-medium">
                    <p>© {currentYear} HexaCore Classes. Built for students, by experts.</p>
                    <div className="flex items-center gap-4">
                        <Link to="/legal" className="hover:text-slate-400">Security</Link>
                        <Link to="/legal" className="hover:text-slate-400">Sitemap</Link>
                        <Link to="/legal" className="hover:text-slate-400">Accessibility</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
