import { useState } from 'react';
import type { DoubtWithAnswers } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, CheckCircle2, Clock, MoreVertical, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { deleteDoubt, updateDoubt, createAnswer } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DoubtCardProps {
  doubt: DoubtWithAnswers;
  onUpdate?: () => void;
}

export default function DoubtCard({ doubt, onUpdate }: DoubtCardProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(doubt.question);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isPostingReply, setIsPostingReply] = useState(false);

  const isOwner = profile?.id === doubt.student_id;
  const isAdmin = profile?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this doubt?')) return;

    setIsDeleting(true);
    const { error } = await deleteDoubt(doubt.id);
    setIsDeleting(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Doubt deleted successfully',
      });
      onUpdate?.();
    }
  };

  const handleUpdate = async () => {
    if (!editedQuestion.trim()) {
      toast({
        title: 'Error',
        description: 'Question cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    const { error } = await updateDoubt(doubt.id, editedQuestion, doubt.image_url || undefined);
    setIsUpdating(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Doubt updated successfully',
      });
      setIsEditDialogOpen(false);
      onUpdate?.();
    }
  };

  const handleReplySubmit = async () => {
    if (!profile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to reply',
        variant: 'destructive',
      });
      return;
    }

    if (!replyText.trim()) {
      toast({
        title: 'Error',
        description: 'Reply cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsPostingReply(true);
    const isExpert = profile.role === 'admin'; // Or other logic if you have 'expert' role
    const { error } = await createAnswer(
      doubt.id,
      profile.id,
      profile.full_name || profile.username,
      replyText,
      isExpert
    );
    setIsPostingReply(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Answer posted successfully',
      });
      setReplyText('');
      setShowReplyInput(false);
      onUpdate?.();
    }
  };

  return (
    <>
      <Card className="border-0 shadow-md overflow-hidden bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4 space-y-4">
          {/* Student Question */}
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 shrink-0 border border-border">
              <AvatarImage src={doubt.student.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User size={20} strokeWidth={1.5} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{doubt.student.username}</p>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={12} strokeWidth={2} />
                    {formatDistanceToNow(new Date(doubt.created_at), { addSuffix: true })}
                  </span>
                  {doubt.status === 'answered' ? (
                    <Badge className="text-xs gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                      <ShieldCheck size={12} strokeWidth={2} />
                      Answered
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Clock size={12} strokeWidth={2} />
                      Pending
                    </Badge>
                  )}
                </div>
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-muted">
                        <MoreVertical size={16} strokeWidth={2} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 size={14} className="mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                {doubt.question}
              </p>
              {doubt.image_url && (
                <img
                  src={doubt.image_url}
                  alt="Doubt attachment"
                  className="mt-3 rounded-lg max-h-80 object-cover border border-border shadow-sm"
                />
              )}

              {/* Reply Toggle Button - Admins Only */}
              {isAdmin && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-8 px-2 text-xs hover:text-primary"
                    onClick={() => setShowReplyInput(!showReplyInput)}
                  >
                    <span className="mr-2">↪</span> Reply
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Reply Input Area */}
          {showReplyInput && (
            <div className="pl-13 ml-5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex gap-3">
                <div className="w-10 flex flex-col items-center">
                  <div className="w-0.5 h-full bg-border/50"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write your answer here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="bg-muted/50 resize-y min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowReplyInput(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleReplySubmit} disabled={isPostingReply}>
                      {isPostingReply ? 'Posting...' : 'Post Answer'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Answers */}
          {doubt.answers.length > 0 && (
            <div className="pl-13 space-y-4 ml-5">
              {doubt.answers.map((answer) => (
                <div key={answer.id} className="relative flex gap-3 group">
                  {/* Thread Line */}
                  <div className="absolute top-0 left-[-20px] bottom-[-16px] w-0.5 bg-border/40 last:bottom-auto last:h-10"></div>
                  <div className="absolute top-4 left-[-20px] w-4 h-0.5 bg-border/40"></div>

                  <div className="flex-1 space-y-1 bg-muted/30 p-3 rounded-xl border border-border/40">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground/90">{answer.expert_name}</p>
                      {answer.is_expert && (
                        <Badge className="text-[10px] h-5 px-1.5 gap-0.5 bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">
                          <CheckCircle2 size={10} strokeWidth={2.5} />
                          Expert
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                      {answer.answer_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[1.25rem]">
          <DialogHeader>
            <DialogTitle>Edit Your Doubt</DialogTitle>
            <DialogDescription>
              Update your question to make it clearer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">Your Question</Label>
              <Textarea
                id="edit-question"
                placeholder="Describe your doubt in detail..."
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                rows={5}
                className="rounded-[1.25rem]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 rounded-[1.25rem]"
              >
                {isUpdating ? 'Updating...' : 'Update Doubt'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-[1.25rem]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
