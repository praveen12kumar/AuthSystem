import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Handles both create (tag=null) and edit (tag passed in) - trigger is
// rendered by the caller so the same dialog shape can be opened from a
// top-level "New Tag" button or a per-row "Edit" button.
const TagFormDialog = ({ tag, open, onOpenChange, onSubmit, isPending }) => {
  const [name, setName] = useState(tag?.name || '');
  const [description, setDescription] = useState(tag?.description || '');

  useEffect(() => {
    if (open) {
      setName(tag?.name || '');
      setDescription(tag?.description || '');
    }
  }, [open, tag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ name, description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{tag ? 'Edit tag' : 'Create a new tag'}</DialogTitle>
            <DialogDescription>
              Tags help students discover courses by category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Web Development"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-description">Description (optional)</Label>
              <Textarea
                id="tag-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of this category"
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : tag ? 'Save changes' : 'Create Tag'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TagFormDialog;
