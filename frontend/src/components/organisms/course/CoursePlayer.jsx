import { ArrowLeft, CheckCircle2, Circle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const CoursePlayer = ({
  course,
  sectionsWithLessons,
  currentLesson,
  progress,
  isLoading,
  canView,
  onMarkComplete,
  isMarkingComplete,
  onSelectLesson
}) => {
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
        <Lock className="size-8 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Enroll to watch this course</h2>
        <p className="text-muted-foreground">
          You need to be enrolled in this course to access its lessons.
        </p>
        <Button asChild className="mt-2">
          <Link to={`/courses/${course?._id}`}>Back to course</Link>
        </Button>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-muted-foreground">
        This course doesn&apos;t have any lessons published yet.
      </div>
    );
  }

  const completedIds = new Set(progress.completedSubSections);
  const isCurrentComplete = completedIds.has(currentLesson._id);

  return (
    <div className="mx-auto flex max-w-7xl flex-col lg:h-[calc(100dvh-4rem)] lg:flex-row">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Link
          to={`/courses/${course._id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {course.title}
        </Link>

        <video
          key={currentLesson._id}
          src={currentLesson.videoUrl}
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          autoPlay
          onEnded={onMarkComplete}
          className="aspect-video w-full rounded-lg bg-black"
        />

        <h1 className="mt-4 text-xl font-semibold">{currentLesson.title}</h1>
        {currentLesson.description && (
          <p className="mt-2 text-muted-foreground">{currentLesson.description}</p>
        )}

        <Button
          className="mt-4"
          variant={isCurrentComplete ? 'secondary' : 'default'}
          disabled={isCurrentComplete || isMarkingComplete}
          onClick={onMarkComplete}
        >
          <CheckCircle2 /> {isCurrentComplete ? 'Completed' : 'Mark as complete'}
        </Button>
      </div>

      <aside className="w-full shrink-0 border-t lg:h-full lg:w-96 lg:overflow-y-auto lg:border-t-0 lg:border-l">
        <div className="space-y-2 p-4">
          <h2 className="font-semibold">Syllabus</h2>
          <div className="flex items-center gap-2">
            <Progress value={progress.percent} className="flex-1" />
            <span className="text-xs text-muted-foreground">{progress.percent}%</span>
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={sectionsWithLessons.map((section) => section._id)}
        >
          {sectionsWithLessons.map((section, index) => (
            <AccordionItem key={section._id} value={section._id}>
              <AccordionTrigger className="px-4">
                {String(index + 1).padStart(2, '0')}. {section.title}
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-1 px-2">
                {section.lessons.map((lesson) => (
                  <button
                    key={lesson._id}
                    type="button"
                    onClick={() => onSelectLesson(lesson._id)}
                    aria-current={lesson._id === currentLesson._id}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent',
                      lesson._id === currentLesson._id && 'bg-accent font-medium'
                    )}
                  >
                    {completedIds.has(lesson._id) ? (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="line-clamp-1 flex-1">{lesson.title}</span>
                  </button>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </aside>
    </div>
  );
};

export default CoursePlayer;
