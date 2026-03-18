import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, LogOut, Clock, Video, Edit, Mail, Phone, Calendar, Facebook, Twitter, Linkedin, Instagram, Trophy, Star, Target, Camera, Trash2 } from 'lucide-react';
import { getUserProgress, updateProfile, getVideos } from '@/services/api';
import type { UserProgress } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import PageMeta from '@/components/common/PageMeta';

export default function Profile() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [totalVideos, setTotalVideos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);



  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    bio: '',
    avatar_url: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
  });

  useEffect(() => {
    if (profile) {
      loadData();
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        facebook_url: profile.facebook_url || '',
        twitter_url: profile.twitter_url || '',
        linkedin_url: profile.linkedin_url || '',
        instagram_url: profile.instagram_url || '',
      });
    }
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    try {
      const [progressRaw, allVideos] = await Promise.all([
        getUserProgress(profile.id, true),
        getVideos(),
      ]);

      const completedCount = Array.isArray(progressRaw) ? progressRaw.filter((p: any) => Number(p.completed) === 1).length : 0;
      const totalTime = Array.isArray(progressRaw) ? progressRaw.reduce((acc: number, p: any) => acc + (Number(p.watch_time) || 0), 0) : 0;
      const totalVideosCount = allVideos.length;
      const percentage = totalVideosCount > 0 ? (completedCount / totalVideosCount) * 100 : 0;

      setTotalVideos(totalVideosCount);
      setProgress({
        id: 'stats',
        user_id: profile.id,
        completed_videos: completedCount,
        total_watch_time: totalTime,
        progress_percentage: Math.min(percentage, 100), // Cap at 100
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to load profile data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    const { error } = await updateProfile(profile.id, formData);
    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditDialogOpen(false);
      await refreshProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully',
    });
    navigate('/login');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLevel = (completed: number) => {
    if (completed >= 50) return "Master Scholar";
    if (completed >= 20) return "Advanced Learner";
    if (completed >= 5) return "Dedicated Student";
    return "Beginner";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
      <PageMeta
        title="My Profile"
        description="Manage your HexaCore Classes account, track your learning progress, and update your professional bio."
        keywords="user profile, learning progress, account settings, HexaCore account"
      />

      {/* Hero Header */}
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 space-y-8">

        {/* Profile Card */}
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-6 md:p-8">
              <ProfilePhotoUpload profile={profile} refreshProfile={refreshProfile} />

              <div className="flex-1 text-center md:text-left space-y-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {profile?.full_name || profile?.username}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 text-sm text-slate-500 font-medium">
                  <span>@{profile?.username}</span>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400">{profile?.email}</span>
                </div>
                {profile?.bio && (
                  <p className="text-slate-600 dark:text-slate-300 max-w-2xl mt-2">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 md:flex-none rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                      <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  {/* Dialog Content (Same as before but styled) */}
                  <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Bio</Label>
                        <Textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Social Links</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Facebook" value={formData.facebook_url} onChange={e => setFormData({ ...formData, facebook_url: e.target.value })} />
                          <Input placeholder="Twitter" value={formData.twitter_url} onChange={e => setFormData({ ...formData, twitter_url: e.target.value })} />
                          <Input placeholder="LinkedIn" value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} />
                          <Input placeholder="Instagram" value={formData.instagram_url} onChange={e => setFormData({ ...formData, instagram_url: e.target.value })} />
                        </div>
                      </div>

                      <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="flex-1 md:flex-none rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Info Bar */}
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 md:px-8 flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-400 rounded-b-xl">
              {profile?.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {format(new Date(profile.date_of_birth), 'dd MMM yyyy')}
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  {profile.phone}
                </div>
              )}
              <div className="flex gap-3 ml-auto">
                {profile?.facebook_url && <a href={profile.facebook_url} target="_blank" className="hover:text-blue-600 transition-colors"><Facebook className="w-4 h-4" /></a>}
                {profile?.twitter_url && <a href={profile.twitter_url} target="_blank" className="hover:text-sky-500 transition-colors"><Twitter className="w-4 h-4" /></a>}
                {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" className="hover:text-blue-700 transition-colors"><Linkedin className="w-4 h-4" /></a>}
                {profile?.instagram_url && <a href={profile.instagram_url} target="_blank" className="hover:text-pink-600 transition-colors"><Instagram className="w-4 h-4" /></a>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Journey Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white">
                <Target className="w-6 h-6 text-blue-600" /> Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : progress ? (
                <div className="space-y-8">
                  {/* Main Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-600 dark:text-slate-400">Overall Completion</span>
                      <span className="text-slate-900 dark:text-white">{progress.progress_percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress.progress_percentage} className="h-3 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 text-center">
                      <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-2">
                        <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{progress.completed_videos} <span className="text-sm font-normal text-slate-400">/ {totalVideos}</span></div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Videos</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 text-center">
                      <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(progress.total_watch_time)}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Watch Time</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 text-center sm:col-span-1 col-span-2">
                      <div className="w-10 h-10 mx-auto bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center mb-2">
                        <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{getLevel(progress.completed_videos)}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Current Level</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>Start watching videos to track your progress!</p>
                  <Button variant="link" className="text-blue-600 mt-2" onClick={() => navigate('/')}>Browse Courses</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements / Badges (Placeholder for future) */}
          <Card className="border-0 shadow-lg bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-xl">🚀</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Early Adopter</h4>
                    <p className="text-xs text-slate-400">Joined HexaCore journey</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 opacity-50">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="text-xl grayscale">🎓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Course Finisher</h4>
                    <p className="text-xs text-slate-400">Complete 1st Course</p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">Next Goal</p>
                  <p className="font-bold">Watch 5 More Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
