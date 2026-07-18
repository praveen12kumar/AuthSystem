import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Check, Film, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateSubSection } from '@/hooks/apis/subsection/useCreateSubSection';
import { useDeleteSubSection } from '@/hooks/apis/subsection/useDeleteSubSection';
import { useSubSections } from '@/hooks/apis/subsection/useSubSections';
import { useUpdateSubSection } from '@/hooks/apis/subsection/useUpdateSubSection';

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const LessonRow = ({ lesson, sectionId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const { updateSubSection, isPending: isUpdating } = useUpdateSubSection();
  const { deleteSubSection, isPending: isDeleting } = useDeleteSubSection();

  const handleSave = async () => {
    if (!title.trim() || title === lesson.title) {
      setIsEditing(false);
      setTitle(lesson.title);
      return;
    }
    try {
      await updateSubSection({ id: lesson._id, title, section: sectionId });
      setIsEditing(false);
    } catch {
      // toast already handled
    }
  };

  const handleReplaceVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await updateSubSection({ id: lesson._id, video: file, section: sectionId });
    } catch {
      // toast already handled
    }
  };

  const isPending = isUpdating || isDeleting;

  return (
    <Motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 rounded-md bg-background px-3 py-2 text-sm"
    >
      <Film className="size-4 shrink-0 text-primary" />
      {isEditing ? (
        <>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUpdating}
            autoFocus
            className="h-7 flex-1"
          />
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isUpdating}
            aria-label="Save lesson title"
          >
            <Check className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setTitle(lesson.title);
            }}
            aria-label="Cancel rename"
          >
            <X className="size-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 truncate">{lesson.title}</span>
          <span className="text-xs text-muted-foreground">
            {formatDuration(lesson.duration)}
          </span>
          <Label
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            title="Replace video"
          >
            <Upload className="size-4" />
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleReplaceVideo}
              disabled={isPending}
              aria-label={`Replace video for ${lesson.title}`}
            />
          </Label>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            disabled={isPending}
            aria-label={`Rename ${lesson.title}`}
          >
            <Pencil className="size-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={isPending}
                aria-label={`Delete ${lesson.title}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{lesson.title}" and its video will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={() =>
                    deleteSubSection({ id: lesson._id, section: sectionId })
                  }
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Motion.div>
  );
};

const LessonManager = ({ sectionId }) => {
  const { subSections, isLoading } = useSubSections(sectionId);
  const { createSubSection, isPending } = useCreateSubSection();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !videoFile) return;
    try {
      await createSubSection({
        title,
        description,
        section: sectionId,
        video: videoFile
      });
      setTitle('');
      setDescription('');
      setVideoFile(null);
      e.target.reset();
    } catch {
      // toast already handled in useCreateSubSection
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : subSections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No lessons yet - add the first one below.
        </p>
      ) : (
        <AnimatePresence initial={false}>
          {subSections.map((lesson) => (
            <LessonRow key={lesson._id} lesson={lesson} sectionId={sectionId} />
          ))}
        </AnimatePresence>
      )}

      <form onSubmit={handleAdd} className="grid gap-2 border-t pt-3">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
            disabled={isPending}
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            disabled={isPending}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor={`video-${sectionId}`}
            className="flex h-9 flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 text-sm text-muted-foreground hover:bg-accent"
          >
            <Upload className="size-4" />
            {videoFile ? videoFile.name : 'Choose a video file'}
          </Label>
          <input
            id={`video-${sectionId}`}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            disabled={isPending}
          />
          <Button
            type="submit"
            disabled={isPending || !title.trim() || !videoFile}
            className="shrink-0"
          >
            <Plus />
            {isPending ? 'Uploading...' : 'Add Lesson'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LessonManager;
