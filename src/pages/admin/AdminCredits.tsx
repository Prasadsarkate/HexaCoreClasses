import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCredit, deleteCredit, getCredits, updateCredit } from '@/services/api';
import type { Credit } from '@/types/types';
import { Plus, Edit, Trash2, ExternalLink, School, Youtube, Layout } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCredits() {
    const [credits, setCredits] = useState<Credit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCredit, setEditingCredit] = useState<Credit | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'youtube',
        logo_url: '',
        description: '',
        course_count: 0,
        link_url: '',
        badge_text: '',
        color_theme: 'from-blue-500 to-indigo-600'
    });

    useEffect(() => {
        loadCredits();
    }, []);

    const loadCredits = async () => {
        try {
            setIsLoading(true);
            const data = await getCredits();
            setCredits(data);
        } catch (error) {
            toast.error("Failed to load credits");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCredit) {
                const { error } = await updateCredit(editingCredit.id, formData);
                if (error) throw error;
                toast.success("Partner updated successfully");
            } else {
                const { error } = await createCredit(formData);
                if (error) throw error;
                toast.success("Partner added successfully");
            }
            setIsDialogOpen(false);
            loadCredits();
            resetForm();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this partner?")) return;
        try {
            const { error } = await deleteCredit(id);
            if (error) throw error;
            toast.success("Partner deleted");
            loadCredits();
        } catch (error) {
            toast.error("Failed to delete partner");
        }
    };

    const openEdit = (credit: Credit) => {
        setEditingCredit(credit);
        setFormData({
            name: credit.name,
            type: credit.type,
            logo_url: credit.logo_url,
            description: credit.description,
            course_count: credit.course_count,
            link_url: credit.link_url,
            badge_text: credit.badge_text || '',
            color_theme: credit.color_theme || 'from-blue-500 to-indigo-600'
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingCredit(null);
        setFormData({
            name: '',
            type: 'youtube',
            logo_url: '',
            description: '',
            course_count: 0,
            link_url: '',
            badge_text: '',
            color_theme: 'from-blue-500 to-indigo-600'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Credits & Partners</h1>
                    <p className="text-muted-foreground">Manage the content partners displayed on the public credits page.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Partner
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingCredit ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="youtube">YouTube Channel</SelectItem>
                                        <SelectItem value="college">College/University</SelectItem>
                                        <SelectItem value="website">Website/Platform</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="logo">Logo URL</Label>
                                <Input id="logo" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="link">Link URL</Label>
                                <Input id="link" value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} placeholder="Channel or Website Link" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="courses">Course Count</Label>
                                    <Input id="courses" type="number" value={formData.course_count} onChange={(e) => setFormData({ ...formData, course_count: parseInt(e.target.value) })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="badge">Badge Text (Optional)</Label>
                                    <Input id="badge" value={formData.badge_text} onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })} placeholder="e.g. Top Rated" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">{editingCredit ? 'Update' : 'Save'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : credits.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8">No partners found. Add one!</TableCell></TableRow>
                        ) : (
                            credits.map((credit) => (
                                <TableRow key={credit.id}>
                                    <TableCell>
                                        <img src={credit.logo_url} alt={credit.name} className="w-10 h-10 rounded-full object-cover border" onError={(e) => (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + credit.name} />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {credit.name}
                                        {credit.badge_text && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{credit.badge_text}</span>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {credit.type === 'youtube' ? <Youtube className="w-4 h-4 text-red-500" /> : credit.type === 'college' ? <School className="w-4 h-4 text-blue-500" /> : <Layout className="w-4 h-4 text-green-500" />}
                                            <span className="capitalize">{credit.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{credit.course_count} Courses</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => window.open(credit.link_url, '_blank')}>
                                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(credit)}>
                                                <Edit className="w-4 h-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(credit.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
