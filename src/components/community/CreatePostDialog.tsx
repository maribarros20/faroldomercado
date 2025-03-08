
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreatePostForm from './CreatePostForm';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: { title: string; content: string }) => void;
  onPostCreated?: () => void;
  channelId?: string;
}

const CreatePostDialogComponent: React.FC<CreatePostDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  onPostCreated,
  channelId
}) => {
  const handleSubmit = (values: { title: string; content: string }) => {
    if (onSubmit) {
      onSubmit(values);
    }
    if (onPostCreated) {
      onPostCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Publicação</DialogTitle>
          <DialogDescription>
            Compartilhe algo com a comunidade!
          </DialogDescription>
        </DialogHeader>
        <CreatePostForm onSubmit={handleSubmit} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialogComponent;
