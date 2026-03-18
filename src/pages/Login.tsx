import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Loader2, Mail, KeyRound, Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [resetStep, setResetStep] = useState(1);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { user, signIn, signUp, signInWithGoogle, verifyEmailOTP, requestPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' });
      return;
    }
    setIsResetting(true);
    const { error } = await requestPasswordReset(resetEmail);
    setIsResetting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Code Sent', description: 'Check your email for the verification code.' });
      setResetStep(2);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetOtp || !newPassword || newPassword.length < 6) {
      toast({ title: 'Error', description: 'Enter valid OTP and password (min 6 chars)', variant: 'destructive' });
      return;
    }
    setIsResetting(true);
    const { error } = await confirmPasswordReset(resetEmail, resetOtp, newPassword);
    setIsResetting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Password reset successfully! You can now login.' });
      setIsResetDialogOpen(false);
      setResetStep(1);
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please enter both email and password', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Login Failed', description: error.message || 'Invalid email or password', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Logged in successfully' });
      navigate(from, { replace: true });
    }
  };

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(username, email, password);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Registration Failed', description: error.message || 'Could not create account', variant: 'destructive' });
    } else {
      toast({ title: 'OTP Sent!', description: 'Please check your email for the verification code.' });
      setShowOtpInput(true);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({ title: 'Error', description: 'Please enter a valid 6-digit OTP', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await verifyEmailOTP(email, otp);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Verification Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Account verified and logged in!' });
      setShowOtpInput(false);
      navigate(from, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);
    if (error) {
      toast({ title: 'Google Sign-In Failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-primary/10">
      {/* OTP Verification Dialog */}
      <Dialog open={showOtpInput} onOpenChange={setShowOtpInput}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl p-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <KeyRound className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900">Verify Your Account</h2>
          <p className="text-center text-slate-500 mb-8">
            Enter the 6-digit code sent to <span className="text-primary font-bold">{email}</span>
          </p>
          <div className="space-y-6">
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="text-center text-3xl h-16 tracking-[1rem] font-bold rounded-2xl border-slate-200 focus:ring-primary focus:border-primary"
              maxLength={6}
            />
            <Button onClick={handleVerifyOTP} className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Verify & Log In'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl p-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <KeyRound className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900">Reset Password</h2>
          <p className="text-center text-slate-500 mb-8 max-w-[280px] mx-auto">
            {resetStep === 1
              ? "Enter your email address and we'll send you a verification code."
              : "Enter the code sent to your email and your new password."}
          </p>

          {resetStep === 1 ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="font-bold text-slate-700 ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={1.5} />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isResetting}
                    className="h-12 rounded-2xl pl-11 border-slate-200"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isResetting} className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20">
                {isResetting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Send Code'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-otp" className="font-bold text-slate-700 ml-1">Verification Code</Label>
                <Input
                  id="reset-otp"
                  type="text"
                  placeholder="123456"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  className="text-center h-12 rounded-2xl border-slate-200 text-xl font-bold tracking-widest"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-new-pass" className="font-bold text-slate-700 ml-1">New Password</Label>
                <Input
                  id="reset-new-pass"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 rounded-2xl border-slate-200"
                />
              </div>
              <Button onClick={handleConfirmReset} disabled={isResetting} className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20">
                {isResetting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Update Password'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Left Side: Branded Illustration/Quote */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <BookOpen className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">HexaCore <span className="text-blue-400 italic">Classes</span></span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
              Unlock Your <span className="text-blue-400">Full Potential</span> with World-Class Education.
            </h2>
            <p className="text-slate-300 text-lg font-medium leading-relaxed">
              Join over 50,000+ students already learning on HexaCore Classes. Start your journey today and master the skills of tomorrow.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <div className="text-primary font-black text-3xl tracking-tighter">500+</div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Free Courses</div>
            </div>
            <div className="space-y-2">
              <div className="text-secondary font-black text-3xl tracking-tighter">24/7</div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Expert Support</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-slate-500">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden ring-2 ring-primary/20">
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
              </div>
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest">Trusted by 50k+ Learners</p>
        </div>
      </div>

      {/* Right Side: Forms */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-12 xl:p-24 relative">
        <div className="w-full max-w-[420px] space-y-12">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="text-white w-6 h-6" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">HexaCore <span className="text-blue-400 italic">Classes</span></span>
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Please enter your details to continue your journey.</p>
          </div>

          <Tabs defaultValue="signin" className="w-full space-y-8">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100/80 p-1.5 rounded-2xl">
              <TabsTrigger value="signin" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0 transition-all duration-300">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="font-bold text-slate-700 ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} strokeWidth={1.5} />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-12 rounded-2xl pl-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor="signin-password" title="password" className="font-bold text-slate-700">Password</Label>
                    <button
                      type="button"
                      onClick={() => setIsResetDialogOpen(true)}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} strokeWidth={1.5} />
                    <Input
                      id="signin-password"
                      type={showSignInPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12 rounded-2xl pl-11 pr-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Log In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0 transition-all duration-300">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="font-bold text-slate-700 ml-1">Full Name</Label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} strokeWidth={1.5} />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="John Doe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="h-12 rounded-2xl pl-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-bold text-slate-700 ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} strokeWidth={1.5} />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-12 rounded-2xl pl-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" title="password" className="font-bold text-slate-700 ml-1">Password</Label>
                    <div className="relative group">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="font-bold text-slate-700 ml-1">Confirm</Label>
                    <Input
                      id="signup-confirm"
                      type={showSignUpPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary transition-all"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </TabsContent>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><Separator /></div>
              <div className="relative flex justify-center text-xs uppercase font-extrabold tracking-widest">
                <span className="bg-white px-4 text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </Tabs>

          <p className="text-center text-sm text-slate-500 font-medium">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline font-bold">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="text-primary hover:underline font-bold">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
