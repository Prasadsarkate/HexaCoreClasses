import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, User, Shield, ShieldOff, Trash2, Lock } from 'lucide-react';
import { getAllUsers, updateUserRole, deleteUser } from '@/services/api';
import type { Profile } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

const SUPER_ADMIN_PASSWORD = 'prasad@9765';

export default function AdminUsers() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Password protection state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!profile || profile.role !== 'admin') {
      navigate('/');
      return;
    }

    // Always require password verification on page load
    setIsVerified(false);
    setPasswordDialogOpen(true);
  }, [profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === SUPER_ADMIN_PASSWORD) {
      // Password correct
      setIsVerified(true);
      setPasswordDialogOpen(false);
      setPassword('');
      setPasswordError('');
      loadUsers();
      toast({
        title: 'Access Granted',
        description: 'Welcome, Super Admin!',
      });
    } else {
      // Password incorrect
      setPasswordError('Incorrect password. Only the super admin can access user management.');
      setPassword('');
    }
  };

  const handlePasswordCancel = () => {
    setPasswordDialogOpen(false);
    navigate('/admin');
  };

  const handleDeleteClick = (user: Profile) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleRoleClick = (user: Profile) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    // Prevent deleting yourself
    if (selectedUser.id === profile?.id) {
      toast({
        title: 'Error',
        description: 'You cannot delete your own account',
        variant: 'destructive',
      });
      setDeleteDialogOpen(false);
      return;
    }

    setIsProcessing(true);
    const result = await deleteUser(selectedUser.id);
    setIsProcessing(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `User ${selectedUser.username} has been deleted`,
      });
      loadUsers();
    }

    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRoleConfirm = async () => {
    if (!selectedUser) return;

    // Prevent changing your own role
    if (selectedUser.id === profile?.id) {
      toast({
        title: 'Error',
        description: 'You cannot change your own role',
        variant: 'destructive',
      });
      setRoleDialogOpen(false);
      return;
    }

    const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
    setIsProcessing(true);
    const result = await updateUserRole(selectedUser.id, newRole);
    setIsProcessing(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `User ${selectedUser.username} is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}`,
      });
      loadUsers();
    }

    setRoleDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Password Verification Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={() => { }}>
        <DialogContent className="rounded-[1.25rem]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock size={24} className="text-primary" />
              Super Admin Verification Required
            </DialogTitle>
            <DialogDescription>
              User management is restricted to the super admin only. Please enter the super admin password to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">Super Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className="rounded-[1.25rem]"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-1">ℹ️ Access Control:</p>
                <p>• Only the super admin can manage users</p>
                <p>• Other admins can manage videos and notes</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handlePasswordCancel}
                className="rounded-[1.25rem]"
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-[1.25rem]">
                Verify
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content - Only shown if verified */}
      {isVerified && (
        <>
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
                <h1 className="text-2xl font-bold">Manage Users</h1>
                <div className="ml-auto flex items-center gap-2 text-sm bg-primary-foreground/10 px-3 py-1 rounded-full">
                  <Lock size={16} />
                  <span>Super Admin</span>
                </div>
              </div>
              <p className="text-sm text-primary-foreground/80 ml-11">
                Manage user accounts and permissions
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {users.map((user) => {
                const isCurrentUser = user.id === profile?.id;
                return (
                  <Card key={user.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <User size={24} className="text-primary" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{user.username}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                            }`}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                          </div>
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleClick(user)}
                            disabled={isCurrentUser}
                            className="flex-1 rounded-[1.25rem]"
                          >
                            {user.role === 'admin' ? (
                              <>
                                <ShieldOff size={16} strokeWidth={1.5} className="mr-1" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <Shield size={16} strokeWidth={1.5} className="mr-1" />
                                Make Admin
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(user)}
                            disabled={isCurrentUser}
                            className="rounded-[1.25rem] text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent className="rounded-[1.25rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{selectedUser?.username}</strong>?
                    This action cannot be undone and will permanently delete the user's account and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-[1.25rem]" disabled={isProcessing}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    disabled={isProcessing}
                    className="rounded-[1.25rem] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isProcessing ? 'Deleting...' : 'Delete User'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Role Change Confirmation Dialog */}
            <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
              <AlertDialogContent className="rounded-[1.25rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Change User Role</AlertDialogTitle>
                  <AlertDialogDescription>
                    {selectedUser?.role === 'admin' ? (
                      <>
                        Are you sure you want to remove admin privileges from <strong>{selectedUser?.username}</strong>?
                        They will become a regular user and lose access to the admin panel.
                      </>
                    ) : (
                      <>
                        Are you sure you want to make <strong>{selectedUser?.username}</strong> an admin?
                        They will gain full access to the admin panel and all management features.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-[1.25rem]" disabled={isProcessing}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRoleConfirm}
                    disabled={isProcessing}
                    className="rounded-[1.25rem]"
                  >
                    {isProcessing ? 'Updating...' : 'Confirm'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
