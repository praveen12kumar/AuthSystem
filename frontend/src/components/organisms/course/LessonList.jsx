import { Film, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { useSubSections } from '@/hooks/apis/subsection/useSubSections';

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const LessonList = ({ sectionId, courseId }) => {
  const { subSections, isLoading } = useSubSections(sectionId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (subSections.length === 0) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Film className="size-4" />
        Lessons coming soon
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {subSections.map((lesson) => (
        <Link
          key={lesson._id}
          to={`/courses/${courseId}/learn/${lesson._id}`}
          className="flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
        >
          <PlayCircle className="size-4 shrink-0 text-primary" />
          <span className="flex-1">{lesson.title}</span>
          <span className="text-xs text-muted-foreground">
            {formatDuration(lesson.duration)}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default LessonList;
