import { useState, useEffect } from "react";
import { FileText, Download, Eye, Image, File, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Document {
  name: string;
  id: string;
  created_at: string;
  metadata: any;
}

interface CaseDocumentsProps {
  caseId: string;
  userId: string;
  onBack: () => void;
}

const CaseDocuments = ({ caseId, userId, onBack }: CaseDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [caseId, userId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .list(userId, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="w-5 h-5 text-nyay-teal" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-destructive" />;
    }
    return <File className="w-5 h-5 text-nyay-indigo" />;
  };

  const handleDownload = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('case-documents')
        .download(`${userId}/${fileName}`);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download document');
    }
  };

  const handleView = async (fileName: string) => {
    try {
      const { data } = supabase.storage
        .from('case-documents')
        .getPublicUrl(`${userId}/${fileName}`);

      window.open(data.publicUrl, '_blank');
    } catch (error) {
      console.error('Error viewing:', error);
      toast.error('Failed to open document');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-48 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack}>
        ← Back to Case
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-nyay-indigo/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-nyay-indigo" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Case Documents</h2>
          <p className="text-muted-foreground text-sm">Documents uploaded by the user</p>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="py-3 px-4">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Documents shared for reference only. These are read-only and uploaded by the user.
          </p>
        </CardContent>
      </Card>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documents</h3>
            <p className="text-muted-foreground text-sm">
              No documents have been uploaded for this case yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {getFileIcon(doc.name)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(doc.created_at)}
                      </span>
                      {doc.metadata?.size && (
                        <span>{formatSize(doc.metadata.size)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleView(doc.name)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDownload(doc.name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseDocuments;
