import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <Card className="w-full max-w-md glass-card border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Password reset is currently disabled in this version.</p>
          <Button onClick={() => navigate('/login')}>Back to Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}
