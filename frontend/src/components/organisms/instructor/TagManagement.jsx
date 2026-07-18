import { motion as Motion } from 'framer-motion';
import { Pencil, Plus, Tags as TagsIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

import TagFormDialog from '@/components/organisms/instructor/TagFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const TagManagement = ({
  tags,
  isLoading,
  usageCounts,
  onCreate,
  onUpdate,
  onDelete,
  isSaving,
  isDeleting
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  const dialogOpen = isCreateOpen || Boolean(editingTag);
  const closeDialog = () => {
    setIsCreateOpen(false);
    setEditingTag(null);
  };

  const handleSubmit = async ({ name, description }) => {
    if (editingTag) {
      await onUpdate(editingTag._id, { name, description });
    } else {
      await onCreate({ name, description });
    }
    closeDialog();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Tags</h1>
          <p className="mt-1 text-muted-foreground">
            Categories students use to browse and filter courses
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus /> New Tag
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <TagsIcon className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">No tags yet</h3>
              <p className="text-sm text-muted-foreground">
                Create a tag so instructors can categorize their courses.
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus /> Create your first tag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {tags.map((tag) => {
            const usageCount = usageCounts[tag._id] || 0;
            return (
              <Motion.div key={tag._id} variants={itemVariants}>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{tag.name}</h3>
                        <Badge variant="outline">
                          {usageCount} course{usageCount === 1 ? '' : 's'}
                        </Badge>
                      </div>
                      {tag.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {tag.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Edit ${tag.name}`}
                        onClick={() => setEditingTag(tag)}
                      >
                        <Pencil /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Delete ${tag.name}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{tag.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {usageCount > 0
                                ? `This tag is used by ${usageCount} course${usageCount === 1 ? '' : 's'}. Deleting it will leave those courses with a dangling tag reference. This cannot be undone.`
                                : 'This cannot be undone.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              disabled={isDeleting}
                              onClick={() => onDelete(tag._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            );
          })}
        </Motion.div>
      )}

      <TagFormDialog
        tag={editingTag}
        open={dialogOpen}
        onOpenChange={(next) => {
          if (!next) closeDialog();
        }}
        onSubmit={handleSubmit}
        isPending={isSaving}
      />
    </div>
  );
};

export default TagManagement;
