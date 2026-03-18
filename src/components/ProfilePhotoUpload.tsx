
import React, { useState } from 'react';
import { Camera, Trash2, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, getAssetUrl } from '@/services/api';

interface ProfilePhotoUploadProps {
    profile: any;
    refreshProfile: () => Promise<void>;
}

export default function ProfilePhotoUpload({ profile, refreshProfile }: ProfilePhotoUploadProps) {
    const { toast } = useToast();
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Google Apps Script URL for Image Upload
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYQ7lDr53TINKH_Fi06Kv6N_66xEmGiirg3KReG_QJvBpewtOSgMZ847sEKYaCyz6P4w/exec";

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast({ title: "Error", description: "File size must be less than 2MB", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result?.toString().split(',')[1];
            const payload = {
                base64: base64,
                mimeType: file.type,
                filename: `profile_${profile?.id}_${Date.now()}`
            };

            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: { "Content-Type": "text/plain" },
                });

                const result = await response.json();

                if (result.result === "success") {
                    let finalUrl = result.url;
                    // Fix for Google Drive Preview Links
                    if (finalUrl.includes('drive.google.com/file/d/')) {
                        const id = finalUrl.split('/d/')[1].split('/')[0];
                        finalUrl = `https://drive.google.com/uc?export=view&id=${id}`;
                    }

                    // Auto-save to backend
                    if (profile) {
                        const { error } = await updateProfile(profile.id, { ...profile, avatar_url: finalUrl });
                        if (!error) {
                            toast({ title: "Success", description: "Profile photo updated successfully!" });
                            await refreshProfile();
                            setIsPhotoDialogOpen(false);
                        } else {
                            console.error("Backend Save Error:", error);
                            toast({ title: "Warning", description: "Photo uploaded but failed to save to profile.", variant: "destructive" });
                        }
                    }
                } else {
                    throw new Error(result.message || "Upload failed");
                }
            } catch (error: any) {
                console.error("Upload Error:", error);
                toast({
                    title: "Upload Failed",
                    description: error.message || "Connection refused. Check GAS permissions.",
                    variant: "destructive"
                });
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
    };

    const handleDeletePhoto = async () => {
        if (!profile) return;
        if (!confirm("Are you sure you want to remove your profile photo?")) return;

        setIsUploading(true);
        try {
            const { error } = await updateProfile(profile.id, { ...profile, avatar_url: '' });
            if (!error) {
                toast({ title: "Success", description: "Profile photo removed." });
                await refreshProfile();
                setIsPhotoDialogOpen(false);
            } else {
                throw new Error(error.message);
            }
        } catch (error: any) {
            toast({ title: "Error", description: "Could not remove photo.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative group">
            <Avatar
                className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-lg -mt-16 md:-mt-20 bg-white cursor-pointer group-hover:opacity-90 transition-opacity"
                onClick={() => setIsPhotoDialogOpen(true)}
            >
                <AvatarImage src={getAssetUrl(profile?.avatar_url) || undefined} className="object-cover w-full h-full" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-black uppercase">
                    {(profile?.full_name || profile?.username || 'U').slice(0, 2)}
                </AvatarFallback>
            </Avatar>

            {/* View/Edit Trigger Overlay */}
            <div
                className="absolute inset-0 -mt-16 md:-mt-20 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                onClick={() => setIsPhotoDialogOpen(true)}
            >
                <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase">View</span>
                </div>
            </div>

            {/* Photo Viewer & Actions Dialog */}
            <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 p-0 overflow-hidden text-white">
                    <DialogHeader className="p-4 border-b border-white/10">
                        <DialogTitle className="text-center">Profile Photo</DialogTitle>
                    </DialogHeader>

                    <div className="flex justify-center items-center p-8 bg-black/50 aspect-square">
                        <Avatar className="w-48 h-48 border-4 border-slate-800 shadow-2xl">
                            <AvatarImage src={getAssetUrl(profile?.avatar_url) || undefined} className="object-cover" />
                            <AvatarFallback className="text-4xl bg-slate-800 text-white font-black uppercase">
                                {(profile?.full_name || profile?.username || 'U').slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-white/10">
                        <button
                            className="flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-900 transition-colors gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <span className="animate-spin text-xl">⏳</span>
                            ) : (
                                <Camera className="w-5 h-5 text-blue-400" />
                            )}
                            <span className="text-xs font-medium text-slate-300">
                                {profile?.avatar_url ? 'Change Photo' : 'Add Photo'}
                            </span>
                        </button>

                        <button
                            className="flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-900 transition-colors gap-2 disabled:opacity-50"
                            onClick={handleDeletePhoto}
                            disabled={!profile?.avatar_url || isUploading}
                        >
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <span className="text-xs font-medium text-slate-300">Delete</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />
        </div>
    );
}
