import { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Code, CheckCircle, Clock, ArrowRight, Send, Reply, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import type { DoubtWithAnswers } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { upvoteDoubt, createAnswer, getAssetUrl, voteInPoll, deleteDoubt, updateDoubt } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, AlertCircle } from 'lucide-react';

interface PostCardProps {
    doubt: DoubtWithAnswers;
}

export default function PostCard({ doubt }: PostCardProps) {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [isUpvoted, setIsUpvoted] = useState(doubt.upvoted || false);
    const [upvoteCount, setUpvoteCount] = useState(doubt.upvotes_count || 0);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [hasImageError, setHasImageError] = useState(false);
    const [userVote, setUserVote] = useState<string | null>(doubt.user_vote || null);
    const [localPollOptions, setLocalPollOptions] = useState(doubt.poll_options || []);
    const [isVoting, setIsVoting] = useState(false);

    // Edit/Delete state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editQuestion, setEditQuestion] = useState(doubt.question);
    const [editCodeSnippet, setEditCodeSnippet] = useState(doubt.code_snippet || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const isOwner = user?.id === doubt.student_id;
    const isAdmin = profile?.role === 'admin';
    const canManage = isOwner || isAdmin;

    // Sync local state when doubt prop updates (e.g. on feed refresh)
    useEffect(() => {
        setUserVote(doubt.user_vote || null);
        setLocalPollOptions(doubt.poll_options || []);
    }, [doubt.id, doubt.poll_options, doubt.user_vote]);

    const handleUpvote = async () => {
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please login to upvote posts',
                variant: 'destructive',
            });
            return;
        }

        // Optimistic UI
        const newIsUpvoted = !isUpvoted;
        setIsUpvoted(newIsUpvoted);
        setUpvoteCount((prev: number) => newIsUpvoted ? prev + 1 : prev - 1);

        try {
            const { error } = await upvoteDoubt(doubt.id, user.id);
            if (error) throw error;
        } catch (error) {
            console.error("Failed to upvote", error);
            // Revert on failure
            setIsUpvoted(!newIsUpvoted);
            setUpvoteCount((prev: number) => !newIsUpvoted ? prev + 1 : prev - 1);
            toast({
                title: 'Error',
                description: 'Failed to process upvote',
                variant: 'destructive',
            });
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please login to reply',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmittingComment(true);
        try {
            const { error } = await createAnswer(
                doubt.id,
                user.id,
                profile?.username || 'Anonymous',
                commentText.trim(),
                false // isExpert
            );

            if (error) throw error;

            toast({
                title: 'Reply Shared',
                description: 'Your comment has been added to the discussion.'
            });
            setCommentText('');
            // Optional: Reload doubts or update local state
            // Community.tsx handles the reload usually via a prop or global state, but here we'll just clear input
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to post comment',
                variant: 'destructive'
            });
        } finally {
            setIsSubmittingComment(false);
        }
    }

    const handleVote = async (optionId: string) => {
        if (!user) {
            toast({ title: 'Login Required', description: 'Please login to vote', variant: 'destructive' });
            return;
        }
        if (isVoting) return;

        // Optimistic UI update
        const previousVote = userVote;
        const previousOptions = [...localPollOptions];

        setUserVote(optionId);
        setLocalPollOptions(prev => prev.map(opt => {
            let newCount = opt.votes_count;
            if (opt.id === optionId) newCount++;
            if (previousVote && opt.id === previousVote) newCount--;
            return { ...opt, votes_count: Math.max(0, newCount) };
        }));

        setIsVoting(true);
        try {
            const { error } = await voteInPoll(doubt.id, optionId);
            if (error) throw error;
        } catch (error) {
            // Revert on failure
            setUserVote(previousVote);
            setLocalPollOptions(previousOptions);
            toast({ title: 'Error', description: 'Failed to register vote', variant: 'destructive' });
        } finally {
            setIsVoting(false);
        }
    };

    const totalVotes = localPollOptions.reduce((acc, opt) => acc + opt.votes_count, 0);

    const handleUpdate = async () => {
        if (!editQuestion.trim()) return;
        setIsUpdating(true);
        try {
            const { error } = await updateDoubt(doubt.id, editQuestion, doubt.image_url || undefined, editCodeSnippet);
            if (error) throw error;

            toast({ title: 'Post Updated', description: 'Your changes have been saved.' });
            setIsEditOpen(false);
            // In a real app, you'd trigger a refresh or update parent state. 
            // For now, we'll suggest a refresh if they don't see changes.
            window.location.reload();
        } catch (error) {
            toast({ title: 'Update Failed', description: 'Could not save your changes.', variant: 'destructive' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const { error } = await deleteDoubt(doubt.id);
            if (error) throw error;

            toast({ title: 'Post Deleted', description: 'Your post has been removed.' });
            setIsDeleted(true);
        } catch (error) {
            toast({ title: 'Delete Failed', description: 'Could not remove the post.', variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isDeleted) return null;

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden group">
            <div className="p-6 sm:p-8 space-y-6">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 rounded-2xl border-2 border-slate-50 ring-4 ring-slate-50/50">
                            <AvatarImage src={getAssetUrl(doubt.student?.avatar_url ?? undefined)} referrerPolicy="no-referrer" />
                            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold">
                                {doubt.student?.username?.slice(0, 2).toUpperCase() || '??'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{doubt.student?.username || 'Anonymous'}</h4>
                                <Badge className="bg-slate-100 text-slate-600 border-0 h-5 px-1.5 text-[9px] font-black uppercase tracking-tighter">Student</Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400" /> {formatDistanceToNow(new Date(doubt.created_at), { addSuffix: true })}</span>
                                <span className="flex items-center gap-1"><Code size={10} strokeWidth={3} className="text-primary/70" /> Web-Dev</span>
                            </div>
                        </div>
                    </div>
                    {canManage && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                    <MoreHorizontal size={18} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-xl border-slate-100">
                                <DropdownMenuItem
                                    onClick={() => setIsEditOpen(true)}
                                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-50 font-bold text-xs"
                                >
                                    <Edit size={14} className="text-primary" /> Edit Post
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 font-bold text-xs"
                                >
                                    <Trash2 size={14} /> Delete Post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {!canManage && (
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-tighter">
                            {doubt.status}
                        </Badge>
                    )}
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                    <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap text-lg">{doubt.question}</p>

                    {doubt.image_url && (
                        <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative group/img">
                            {!hasImageError ? (
                                <img
                                    src={getAssetUrl(doubt.image_url)}
                                    alt="Post Attachment"
                                    referrerPolicy="no-referrer"
                                    onError={() => setHasImageError(true)}
                                    className="w-full object-cover max-h-[500px] hover:scale-105 transition-transform duration-700 cursor-zoom-in"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover/img:bg-primary/10 group-hover/img:text-primary transition-colors">
                                        <ImageIcon size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-700">Attachment Preview Unavailable</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                            This private asset is protected by Google Drive.<br />You can view it directly using the link below.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(doubt.image_url!, '_blank')}
                                        className="rounded-xl border-slate-200 font-bold bg-white hover:bg-primary hover:text-white hover:border-primary transition-all text-[10px] uppercase tracking-widest gap-2"
                                    >
                                        Open in Google Drive <Share2 size={12} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Code Snippet Activation */}
                    {doubt.type === 'code' && doubt.code_snippet && (
                        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-slate-300 shadow-xl">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Source Code</span>
                                <Badge variant="outline" className="border-slate-700 text-slate-400 text-[9px]">TypeScript</Badge>
                            </div>
                            <pre className="overflow-x-auto">
                                <code>{doubt.code_snippet}</code>
                            </pre>
                        </div>
                    )}

                    {/* Poll Interaction */}
                    {doubt.type === 'poll' && localPollOptions.length > 0 && (
                        <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare size={14} className="text-secondary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Community Poll</span>
                            </div>
                            <div className="space-y-3">
                                {localPollOptions.map((option, index) => {
                                    const percentage = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;
                                    const isSelected = userVote === option.id;

                                    return (
                                        <div key={option.id} className="relative">
                                            <Button
                                                variant="outline"
                                                disabled={isVoting}
                                                onClick={() => handleVote(option.id)}
                                                className={`w-full justify-start h-14 rounded-2xl border-slate-200 bg-white hover:border-primary/30 transition-all font-bold group relative overflow-hidden ${isSelected ? 'border-primary ring-2 ring-primary/10' : ''}`}
                                            >
                                                {/* Percentage Bar Background */}
                                                <div
                                                    className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isSelected ? 'bg-primary/10' : 'bg-slate-100/50'}`}
                                                    style={{ width: `${percentage}%` }}
                                                />

                                                <div className="relative z-10 flex items-center w-full">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className="flex-1 text-left">{option.option_text}</span>
                                                    {totalVotes > 0 && (
                                                        <span className={`text-xs ml-2 ${isSelected ? 'text-primary font-black' : 'text-slate-400 font-bold'}`}>
                                                            {percentage}%
                                                        </span>
                                                    )}
                                                </div>
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between mt-4 px-2">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                    {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'} cast so far
                                </p>
                                {userVote && (
                                    <Badge className="bg-primary/10 text-primary border-0 text-[8px] font-black uppercase tracking-tighter">
                                        Your Vote Recorded
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Post Footer / Actions */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleUpvote}
                            className={`h-11 rounded-2xl px-5 font-black flex items-center gap-2 transition-all duration-300 ${isUpvoted ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-primary/5 hover:text-primary hover:scale-[1.02]"
                                }`}
                        >
                            <ThumbsUp size={18} fill={isUpvoted ? "currentColor" : "none"} className={isUpvoted ? "animate-bounce" : ""} />
                            <span>{upvoteCount} Upvotes</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => setShowComments(!showComments)}
                            className={`h-11 rounded-2xl px-5 font-black flex items-center gap-2 transition-all duration-300 ${showComments ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <MessageSquare size={18} />
                            <span>{doubt.answers?.length || 0} Comments</span>
                        </Button>
                    </div>

                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors">
                        <Share2 size={18} />
                    </Button>
                </div>
            </div>

            {/* Nested Comments Section */}
            {showComments && (
                <div className="bg-slate-50/50 border-t border-slate-100 p-6 sm:p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 rounded-xl border border-white shadow-sm">
                            <AvatarImage src={getAssetUrl(profile?.avatar_url ?? undefined) || `https://i.pravatar.cc/100?u=${profile?.id || 'me'}`} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{(profile?.username || 'ME').slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative group">
                            <Input
                                placeholder="Write a reply..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                disabled={isSubmittingComment}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                className="h-12 bg-white rounded-xl border-slate-100 focus:bg-white transition-all pl-4 pr-12 text-sm font-medium"
                            />
                            <button
                                onClick={handleCommentSubmit}
                                disabled={isSubmittingComment || !commentText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {doubt.answers && doubt.answers.length > 0 ? (
                            doubt.answers.map((answer) => (
                                <div key={answer.id} className="flex gap-4">
                                    <Avatar className="w-10 h-10 rounded-xl border border-white shadow-sm shrink-0">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${answer.expert_name}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold uppercase">{answer.expert_name.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2 flex-1">
                                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm relative">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-slate-900">{answer.expert_name}</span>
                                                {answer.is_expert && (
                                                    <Badge className="bg-orange-100 text-orange-600 border border-orange-200 h-4 px-1.5 text-[8px] font-black uppercase tracking-tighter shadow-sm shadow-orange-100">Expert</Badge>
                                                )}
                                                <span className="text-[10px] text-slate-500 ml-auto uppercase font-bold tracking-widest">{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}</span>
                                            </div>
                                            <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                                {answer.answer_text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-xs text-slate-400 font-bold italic py-4">No comments yet. Start the conversation!</p>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Comment Section Preview (Only if comments hidden) */}
            {!showComments && (
                <div className="bg-slate-50/50 p-4 border-t border-slate-100/50 flex items-center justify-between group-hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 px-4">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Join the discussion</span>
                    </div>
                    <Button
                        variant="link"
                        onClick={() => setShowComments(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:no-underline"
                    >
                        View Thread <ArrowRight size={12} className="ml-1" />
                    </Button>
                </div>
            )}
            {/* Edit Post Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8 border-none shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Edit Post</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium text-lg leading-relaxed">
                            Refine your thoughts or update your question for the community.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Question</Label>
                            <Textarea
                                value={editQuestion}
                                onChange={(e) => setEditQuestion(e.target.value)}
                                className="min-h-[120px] rounded-[1.5rem] border-slate-200 focus:border-primary focus:ring-primary/20 bg-slate-50/50 p-6 text-lg font-semibold placeholder:text-slate-300 transition-all"
                            />
                        </div>
                        {doubt.type === 'code' && (
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Code Snippet</Label>
                                <Textarea
                                    value={editCodeSnippet}
                                    onChange={(e) => setEditCodeSnippet(e.target.value)}
                                    className="font-mono text-sm bg-slate-950 text-slate-100 rounded-[1.5rem] min-h-[200px] p-6 border-none scrollbar-hide"
                                />
                            </div>
                        )}
                        {doubt.type === 'poll' && (
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
                                <AlertCircle size={20} className="shrink-0" />
                                <p className="text-xs font-bold leading-relaxed">
                                    Poll options cannot be changed after creation to maintain vote integrity. You can only edit the main question.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-2xl h-12 px-6 font-bold hover:bg-slate-100">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={isUpdating || !editQuestion.trim()}
                            className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] p-8 border-none shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Trash2 className="text-red-500" size={24} /> Delete Post?
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium text-lg leading-relaxed">
                            This action cannot be undone. All votes and comments on this post will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 mt-4">
                        <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)} className="rounded-2xl h-12 px-6 font-bold hover:bg-slate-100">
                            Keep it
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
