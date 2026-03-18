import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getPDFs, createPDF, updatePDF, deletePDF, getSubjects, getPlaylists } from '@/services/api';
import type { PDF } from '@/types/types';
import PDFCard from '@/components/PDFCard';

export default function AdminPDFs() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [pdfs, setPDFs] = useState<PDF[]>([]);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadPDFs();
  }, [profile, navigate]);

  const loadPDFs = async () => {
    const data = await getPDFs();
    setPDFs(data);
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
            <h1 className="text-2xl font-bold">Manage PDFs</h1>
          </div>
        </div>
      </div>
      <div className="px-4 py-6 space-y-4">
        {pdfs.map((pdf) => (
          <PDFCard key={pdf.id} pdf={pdf} />
        ))}
      </div>
    </div>
  );
}
