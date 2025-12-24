import { useState } from "react";
import { Shield, Trash2, LogOut, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleClearChatHistory = async () => {
    setIsDeleting('chat');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('sender_id', user.id);

      if (error) throw error;

      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast.error('Failed to clear chat history');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteDocuments = async () => {
    setIsDeleting('documents');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // List and delete all user documents
      const { data: files, error: listError } = await supabase.storage
        .from('case-documents')
        .list(user.id);

      if (listError) throw listError;

      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from('case-documents')
          .remove(filePaths);

        if (deleteError) throw deleteError;
      }

      toast.success('Documents deleted');
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast.error('Failed to delete documents');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleLogoutAllSessions = async () => {
    setIsDeleting('sessions');
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success('Logged out from all sessions');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    } finally {
      setIsDeleting(null);
    }
  };

  const ActionDialog = ({ 
    title, 
    description, 
    action, 
    actionLabel,
    children 
  }: { 
    title: string; 
    description: string; 
    action: () => void; 
    actionLabel: string;
    children: React.ReactNode;
  }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={action} className="bg-destructive hover:bg-destructive/90">
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-nyay-indigo/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-nyay-indigo" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Privacy & Data Control</h2>
          <p className="text-muted-foreground text-sm">Manage your data and privacy settings</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Clear Chat History */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Clear Chat History</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Delete all your messages with lawyers. This cannot be undone.
                </p>
              </div>
              <ActionDialog
                title="Clear Chat History"
                description="This will permanently delete all your chat messages with lawyers. This action cannot be undone."
                action={handleClearChatHistory}
                actionLabel="Clear All Chats"
              >
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  disabled={isDeleting === 'chat'}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </ActionDialog>
            </div>
          </CardContent>
        </Card>

        {/* Delete Documents */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Delete Uploaded Documents</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Remove all documents you've uploaded for your cases.
                </p>
              </div>
              <ActionDialog
                title="Delete All Documents"
                description="This will permanently delete all documents you've uploaded. Lawyers will no longer have access to these files."
                action={handleDeleteDocuments}
                actionLabel="Delete All"
              >
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  disabled={isDeleting === 'documents'}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </ActionDialog>
            </div>
          </CardContent>
        </Card>

        {/* Logout All Sessions */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Logout from All Sessions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sign out from all devices and browsers where you're logged in.
                </p>
              </div>
              <ActionDialog
                title="Logout All Sessions"
                description="You will be logged out from all devices including this one. You'll need to log in again."
                action={handleLogoutAllSessions}
                actionLabel="Logout All"
              >
                <Button 
                  variant="outline" 
                  disabled={isDeleting === 'sessions'}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout All
                </Button>
              </ActionDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Notice */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-nyay-teal shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Your Privacy Matters</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is handled securely and used only for legal assistance. We do not share your personal information with third parties without your consent. All communications are encrypted.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;