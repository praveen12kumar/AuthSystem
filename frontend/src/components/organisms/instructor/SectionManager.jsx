import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useState } from 'react';

import LessonManager from '@/components/organisms/instructor/LessonManager';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateSection } from '@/hooks/apis/section/useCreateSection';
import { useDeleteSection } from '@/hooks/apis/section/useDeleteSection';
import { useSections } from '@/hooks/apis/section/useSections';
import { useUpdateSection } from '@/hooks/apis/section/useUpdateSection';
import { cn } from '@/lib/utils';

const SectionRow = ({ section, courseId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [showLessons, setShowLessons] = useState(false);
  const { updateSection, isPending: isUpdating } = useUpdateSection();
  const { deleteSection, isPending: isDeleting } = useDeleteSection();

  const handleSave = async () => {
    if (!title.trim() || title === section.title) {
      setIsEditing(false);
      setTitle(section.title);
      return;
    }
    try {
      await updateSection({ id: section._id, title, course: courseId });
      setIsEditing(false);
    } catch {
      // toast already handled
    }
  };

  return (
    <Motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <GripVertical className="size-4 shrink-0 text-muted-foreground" />
        {isEditing ? (
          <>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUpdating}
              autoFocus
              className="h-8"
            />
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isUpdating}
            >
              <Check className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setTitle(section.title);
              }}
            >
              <X className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-sm font-medium">
              {section.title}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowLessons((prev) => !prev)}
              className="text-muted-foreground"
            >
              Lessons
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  showLessons && 'rotate-180'
                )}
              />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete section?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{section.title}" will be permanently removed from this
                    course.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeleting}
                    onClick={() =>
                      deleteSection({ id: section._id, course: courseId })
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
      </div>
      {showLessons && (
        <div className="mt-2 pl-7">
          <LessonManager sectionId={section._id} />
        </div>
      )}
    </Motion.div>
  );
};

const SectionManager = ({ courseId }) => {
  const { sections, isLoading } = useSections(courseId);
  const { createSection, isPending: isCreating } = useCreateSection();
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await createSection({ title: newTitle, course: courseId });
      setNewTitle('');
    } catch {
      // toast already handled
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Curriculum</CardTitle>
        <p className="text-sm text-muted-foreground">
          Break your course into sections. Add lessons to each one later.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sections.map((section) => (
              <SectionRow
                key={section._id}
                section={section}
                courseId={courseId}
              />
            ))}
          </AnimatePresence>
        )}

        {sections.length === 0 && !isLoading && (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            No sections yet - add your first one below.
          </p>
        )}

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Getting Started"
            disabled={isCreating}
          />
          <Button type="submit" disabled={isCreating || !newTitle.trim()}>
            <Plus /> Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectionManager;
