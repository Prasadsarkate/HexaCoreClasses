import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquarePlus, Filter } from 'lucide-react';
import { getDoubts, createAnswer, deleteDoubt, deleteAnswer } from '@/services/api';
import type { DoubtWithAnswers } from '@/types/types';
import DoubtCard from '@/components/DoubtCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Clock, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDoubts() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doubts, setDoubts] = useState<DoubtWithAnswers[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'answered'>('all');
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<DoubtWithAnswers | null>(null);
  const [expertName, setExpertName] = useState(profile?.full_name || 'Expert');
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadDoubts();
  }, [profile, navigate]);

  const loadDoubts = async () => {
    const data = await getDoubts();
    setDoubts(data);
  };

  const filteredDoubts = doubts.filter((doubt) => {
    if (selectedTab === 'all') return true;
    return doubt.status === selectedTab;
  });

  const pendingCount = doubts.filter((d) => d.status === 'pending').length;
  const answeredCount = doubts.filter((d) => d.status === 'answered').length;

  const handleAnswerDoubt = (doubt: DoubtWithAnswers) => {
    setSelectedDoubt(doubt);
    setAnswerText('');
    setAnswerDialogOpen(true);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedDoubt || !answerText.trim() || !expertName.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!profile) return;

    setIsSubmitting(true);
    const { error } = await createAnswer(
      selectedDoubt.id,
      profile.id,
      expertName,
      answerText,
      true // isExpert (Admin)
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
        title: 'Success',
        description: 'Answer posted successfully',
      });
      setAnswerDialogOpen(false);
      setSelectedDoubt(null);
      setAnswerText('');
      loadDoubts();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground shadow-md">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Button>
            <h1 className="text-2xl font-bold">Manage Doubts</h1>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Answer student questions and manage doubts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{doubts.length}</p>
              <p className="text-sm text-muted-foreground">Total Doubts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{answeredCount}</p>
              <p className="text-sm text-muted-foreground">Answered</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({doubts.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="answered">
              Answered ({answeredCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Doubts List */}
        <div className="space-y-4">
          {filteredDoubts.length > 0 ? (
            filteredDoubts.map((doubt) => (
              <div key={doubt.id} className="relative">
                <DoubtCard doubt={doubt} onUpdate={loadDoubts} />
                {doubt.status === 'pending' && (
                  <div className="absolute top-4 right-4">
                    <Button
                      onClick={() => handleAnswerDoubt(doubt)}
                      size="sm"
                      className="gap-2"
                    >
                      <MessageSquarePlus size={16} strokeWidth={2} />
                      Answer
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedTab === 'pending'
                  ? 'No pending doubts'
                  : selectedTab === 'answered'
                    ? 'No answered doubts yet'
                    : 'No doubts found'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Answer Dialog */}
      <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
        <DialogContent className="rounded-[1.25rem] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Answer Doubt</DialogTitle>
            <DialogDescription>
              Provide a helpful answer to the student's question
            </DialogDescription>
          </DialogHeader>

          {selectedDoubt && (
            <div className="space-y-4 py-4">
              {/* Show the doubt */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={selectedDoubt.student.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User size={20} strokeWidth={1.5} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{selectedDoubt.student.username}</p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} strokeWidth={2} />
                          {formatDistanceToNow(new Date(selectedDoubt.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {selectedDoubt.question}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answer form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expert-name">Your Name (as Expert)</Label>
                  <Input
                    id="expert-name"
                    placeholder="Enter your name"
                    value={expertName}
                    onChange={(e) => setExpertName(e.target.value)}
                    className="rounded-[1.25rem]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Provide a detailed answer..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={6}
                    className="rounded-[1.25rem]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting}
                  className="flex-1 rounded-[1.25rem]"
                >
                  {isSubmitting ? 'Posting...' : 'Post Answer'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAnswerDialogOpen(false)}
                  className="rounded-[1.25rem]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
