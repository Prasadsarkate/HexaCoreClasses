import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Youtube, BookOpen, GraduationCap, Heart, Award, Star, Layout } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { getCredits } from '@/services/api';
import type { Credit } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';

const Credits: React.FC = () => {
  const [partners, setPartners] = useState<Credit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await getCredits();
      setPartners(data);
    } catch (error) {
      console.error("Failed to load credits", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTheme = (type: string, defaultTheme?: string) => {
    switch (type) {
      case 'youtube': return 'from-red-600 to-red-700'; // YouTube Red
      case 'website': return 'from-teal-600 to-emerald-600'; // Website Teal/Green
      case 'college': return 'from-blue-600 to-indigo-700'; // College Blue
      default: return defaultTheme || 'from-slate-600 to-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-20 sm:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="container relative mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-medium text-white/90 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>Made with Gratitude</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Our Content Partners
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            HexaCore Classes stands on the shoulders of giants. We proudly acknowledge the creators whose world-class content powers our platform.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {isLoading ? (
            // Loading Skeletons
            [1, 2, 3].map((i) => (
              <Card key={i} className="h-80 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="h-24 bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <CardContent className="pt-12 space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))
          ) : (
            partners.map((partner, idx) => (
              <Card
                key={partner.id}
                className="group overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`h-24 bg-gradient-to-r ${getTheme(partner.type, partner.color_theme)} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute top-4 right-4">
                    {partner.badge_text && (
                      <Badge className="bg-white/20 backdrop-blur-md border-0 text-white shadow-sm font-medium">
                        {partner.badge_text}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="relative px-6 -mt-12 mb-4 flex justify-between items-end">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-white">
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + partner.name }}
                    />
                  </div>
                  <div className="mb-1">
                    {partner.type === 'youtube' ? (
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full text-red-600 dark:text-red-400">
                        <Youtube size={20} />
                      </div>
                    ) : partner.type === 'college' ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full text-blue-600 dark:text-blue-400">
                        <GraduationCap size={20} />
                      </div>
                    ) : (
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-full text-green-600 dark:text-green-400">
                        <Layout size={20} />
                      </div>
                    )}
                  </div>
                </div>

                <CardHeader className="pt-0 pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    {partner.name}
                    {/* Award Icon logic could go here if Badge Text is 'Top Educator' */}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    {partner.type === 'youtube' ? 'Educational Channel' : partner.type === 'college' ? 'University Course' : 'Web Platform'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm h-10 line-clamp-2">
                    {partner.description}
                  </p>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="text-xs font-semibold text-slate-500">Contribution</div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg shadow-sm">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      {partner.course_count} Playlists
                    </div>
                  </div>

                  <Button
                    className={`w-full group-hover:shadow-lg transition-all duration-300 bg-gradient-to-r ${getTheme(partner.type, partner.color_theme)} text-white border-0`}
                    onClick={() => window.open(partner.link_url, '_blank')}
                  >
                    <span className="flex items-center gap-2">
                      {partner.type === 'youtube' ? 'Subscribe Channel' : 'Visit Website'}
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}

          {/* Join Us Card */}
          <Card className="group border-dashed border-2 border-slate-300 dark:border-slate-700 bg-transparent flex flex-col items-center justify-center p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Are you an Creator?</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              We are always looking for high-quality educational content to help our students.
            </p>
            <Button variant="outline" className="w-full">
              Partner With Us
            </Button>
          </Card>

        </div>

        {/* Footer Note */}
        <div className="mt-24 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-slate-700 dark:text-slate-200">HexaCore Classes</h4>
              <p className="text-sm text-slate-500">© {new Date().getFullYear()} Project Team. All rights reserved.</p>
            </div>

            <div className="flex gap-6 text-sm font-medium">
              <a href="/about" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                Project Overview
              </a>
              <a href="/legal" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/legal" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Developed by <span className="font-semibold text-slate-600 dark:text-slate-300">Prasad Sarkate</span> (Lead), Yash Dalvee & Gaurav Ravankar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;
