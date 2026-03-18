import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { Camera, Plus, Image as ImageIcon, Code, Sparkles, MessageCircle, TrendingUp, Info, Hash, Users, MessageSquare, Award, UserPlus } from 'lucide-react';
import { getDoubts, createDoubt, getCommunityStats, getAssetUrl } from '@/services/api';
import { X } from 'lucide-react';
import React, { useRef } from 'react';
import type { DoubtWithAnswers } from '@/types/types';
import PostCard from '@/components/community/PostCard';
import CommunitySidebar from '@/components/community/CommunitySidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const COMMUNITY_GAS_URL = "https://script.google.com/macros/s/AKfycbw-uj7otkHI9bTlNG1j3n_n4SXmRInEiFvc_szcaxAhTTV8bxCuZCcNoB73WIeFfTG6/exec";

export default function Community() {
  const [doubts, setDoubts] = useState<DoubtWithAnswers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState('general');
  const [question, setQuestion] = useState('');
  const [postType, setPostType] = useState<'post' | 'poll' | 'code'>('post');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [communityImageUrl, setCommunityImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { profile, user } = useAuth();

  useEffect(() => {
    loadDoubts();
  }, [activeChannel]);

  const loadDoubts = async () => {
    setIsLoading(true);
    try {
      const data = await getDoubts(activeChannel, user?.id);
      setDoubts(data || []);
    } catch (error) {
      console.error("Failed to load community posts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your question',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to post in the community',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await createDoubt(
      user.id,
      question,
      activeChannel,
      postType,
      postType === 'code' ? codeSnippet : undefined,
      communityImageUrl || undefined,
      postType === 'poll' ? pollOptions.filter(opt => opt.trim() !== '') : undefined
    );
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Post Created',
        description: 'Your contribution has been shared with the community!',
      });
      setQuestion('');
      setPostType('post');
      setPollOptions(['', '']);
      setCodeSnippet('');
      setCommunityImageUrl(null);
      setIsDialogOpen(false);
      loadDoubts();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "File size must be less than 2MB", variant: "destructive" });
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      const payload = {
        base64: base64,
        mimeType: file.type,
        filename: `community_${user?.id}_${Date.now()}`
      };

      try {
        const response = await fetch(COMMUNITY_GAS_URL, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "text/plain" },
        });

        const result = await response.json();

        if (result.result === "success") {
          let finalUrl = result.url;
          if (finalUrl.includes('drive.google.com/file/d/')) {
            const id = finalUrl.split('/d/')[1].split('/')[0];
            finalUrl = `https://drive.google.com/uc?export=view&id=${id}`;
          }
          setCommunityImageUrl(finalUrl);
          toast({ title: "Success", description: "Image uploaded successfully!" });
        } else {
          throw new Error(result.message || "Upload failed");
        }
      } catch (error: any) {
        console.error("Upload Error:", error);
        toast({
          title: "Upload Failed",
          description: error.message || "Could not upload image.",
          variant: "destructive"
        });
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      <PageMeta
        title="Community Forum"
        description="Connect with other tech enthusiasts, ask questions, and share your knowledge on HexaCore Classes. A place for learners to build the tech future together."
        keywords="student community, tech forum, hexacore community, peer learning, student discussions"
      />
      {/* Hero Header */}
      <div className="bg-slate-900 pt-12 pb-24 -mx-4 sm:-mx-6 lg:-mx-8 px-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <Badge className="bg-primary/20 text-primary border-primary/20 h-8 px-4 font-black uppercase tracking-widest text-[10px]">
              <Sparkles size={12} className="mr-2" /> Community Forum
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Learn From Your <span className="text-blue-400 italic">Peers</span></h1>
            <p className="text-slate-300 max-w-xl text-lg font-medium leading-relaxed">
              Join a vibrant community of learners. Ask questions, share insights, and build the future together.
            </p>
          </div>

          <div className="flex gap-4 md:mb-2">
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
              <p className="text-primary text-2xl font-black leading-none">{isLoading ? "..." : doubts.length > 1000 ? `${(doubts.length / 1000).toFixed(1)} k + ` : doubts.length}</p>
              <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mt-1">Discussions</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
              <p className="text-secondary text-2xl font-black leading-none">800+</p>
              <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mt-1">Experts Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 lg:px-0 -mt-12 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Sidebar - Hidden on small screens, shown as column */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <CommunitySidebar activeChannel={activeChannel} onChannelChange={setActiveChannel} />
          </div>

          {/* Main Feed Area */}
          <div className="lg:col-span-9 space-y-8 order-1 lg:order-2">

            {/* Create Post Interface */}
            <div className="bg-white rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="flex gap-4 items-center mb-6">
                <Avatar className="w-12 h-12 rounded-2xl ring-4 ring-slate-50 shadow-sm">
                  <AvatarImage src={getAssetUrl(profile?.avatar_url ?? undefined)} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{(profile?.username || 'G').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar >
                <div className="flex-1">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="w-full h-14 bg-slate-50 hover:bg-slate-100/50 text-left px-6 rounded-2xl text-slate-500 font-bold transition-all border border-slate-100/50 group">
                        What's on your mind, <span className="text-slate-900 font-black">{profile?.username || 'there'}</span>?
                        <Sparkles size={16} className="float-right mt-1 opacity-0 group-hover:opacity-100 text-primary transition-all" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden max-w-2xl">
                      <div className="bg-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black tracking-tight">Post to <span className="text-primary italic">#{activeChannel}</span></DialogTitle>
                          <DialogDescription className="text-slate-400 font-medium">
                            Your post will be visible to everyone in the community.
                          </DialogDescription>
                        </DialogHeader>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="space-y-4">
                          <Label htmlFor="question" className="text-sm font-black uppercase tracking-widest text-slate-500">Your Discussion</Label>
                          <Textarea
                            id="question"
                            placeholder={postType === 'poll' ? "Ask a question for your poll..." : "What would you like to discuss? Use markdown for code..."}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            rows={postType === 'post' ? 8 : 4}
                            className="rounded-[2rem] border-slate-200 focus:border-primary focus:ring-primary/20 bg-slate-50/50 focus:bg-white resize-none text-base p-6 transition-all"
                          />
                        </div>

                        {postType === 'code' && (
                          <div className="space-y-4 animate-in slide-in-from-top-2">
                            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Code Snippet</Label>
                            <Textarea
                              value={codeSnippet}
                              onChange={(e) => setCodeSnippet(e.target.value)}
                              placeholder="// Paste your code here..."
                              className="font-mono text-sm bg-slate-900 text-slate-100 rounded-2xl h-48 p-4"
                            />
                          </div>
                        )}

                        {postType === 'poll' && (
                          <div className="space-y-4 animate-in slide-in-from-top-2">
                            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Poll Options</Label>
                            <div className="grid gap-3">
                              {pollOptions.map((opt, i) => (
                                <Input
                                  key={i}
                                  placeholder={`Option ${i + 1}`}
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...pollOptions];
                                    newOpts[i] = e.target.value;
                                    setPollOptions(newOpts);
                                  }}
                                  className="rounded-xl h-11"
                                />
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPollOptions([...pollOptions, ''])}
                                className="text-[10px] uppercase font-black tracking-widest"
                              >+ Add Option</Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="rounded-xl border-slate-200 h-11 px-4 text-xs font-bold gap-2">
                            <Code size={16} className="text-primary" /> Attach Code
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 h-11 px-4 text-xs font-bold gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                          >
                            {isUploadingImage ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <ImageIcon size={16} className="text-primary" />
                            )}
                            {communityImageUrl ? 'Change Image' : 'Upload Image'}
                          </Button>

                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </div>

                        {communityImageUrl && (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-100 group">
                            <img src={communityImageUrl} alt="Upload Preview" className="w-full h-48 object-cover" />
                            <button
                              onClick={() => setCommunityImageUrl(null)}
                              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}

                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="ml-auto min-w-[140px] h-12 rounded-2xl bg-slate-900 hover:bg-primary font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
                        >
                          {isSubmitting ? 'Posting...' : 'Share Post'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Separator className="bg-slate-50" />

              <div className="flex items-center gap-4 mt-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mr-auto">Add to post:</span>
                <button
                  onClick={() => { setPostType('post'); setIsDialogOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-xs transition-all group"
                >
                  <ImageIcon size={16} className="text-secondary group-hover:scale-110 transition-transform" /> Image
                </button>
                <button
                  onClick={() => { setPostType('code'); setIsDialogOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-xs transition-all group"
                >
                  <Code size={16} className="text-primary group-hover:scale-110 transition-transform" /> Code Snippet
                </button>
                <button
                  onClick={() => { setPostType('poll'); setIsDialogOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-xs transition-all group"
                >
                  <MessageCircle size={16} className="text-primary group-hover:scale-110 transition-transform" /> Poll
                </button>
              </div>
            </div >

            {/* Trending / Notification Bar */}
            < div className="flex items-center gap-3 bg-primary/5 border border-primary/10 p-4 px-8 rounded-[2rem] shadow-sm shadow-primary/5 transition-all hover:shadow-md hover:shadow-primary/10" >
              <TrendingUp size={18} className="text-primary" />
              <p className="text-xs font-bold text-slate-700">
                <span className="text-primary font-black uppercase mr-2 tracking-widest">Trending:</span>
                "How to get started with Cyber Security in 2026" - Join the conversation!
              </p>
              <Button variant="ghost" size="sm" className="ml-auto text-[10px] font-black uppercase h-8 hover:bg-primary/10 rounded-xl">View Discussion</Button>
            </div >

            {/* Doubts Feed */}
            < div className="space-y-10" >
              {
                isLoading ? (
                  <div className="space-y-8" >
                    {
                      [1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-[3rem] bg-slate-100" />
                      ))
                    }
                  </div>
                ) : doubts.length > 0 ? (
                  <div className="space-y-10">
                    {doubts.map((doubt) => (
                      <PostCard key={doubt.id} doubt={doubt} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <MessageCircle size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900">The feed is quiet...</h3>
                      <p className="text-slate-500 max-w-sm mx-auto font-medium">Be the first one to start a meaningful discussion or ask a question!</p>
                    </div>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                    >
                      Start a Discussion
                    </Button>
                  </div>
                )}
            </div >
          </div >
        </div >
      </div >
    </div >
  );
}
