import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Film, Play } from 'lucide-react';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useSubSections } from '@/hooks/apis/subsection/useSubSections';

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const LessonList = ({ sectionId }) => {
  const { subSections, isLoading } = useSubSections(sectionId);
  const [playingId, setPlayingId] = useState(null);

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
      {subSections.map((lesson) => {
        const isPlaying = playingId === lesson._id;
        return (
          <div key={lesson._id} className="rounded-md border">
            <button
              type="button"
              onClick={() => setPlayingId(isPlaying ? null : lesson._id)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <Play className="size-4 shrink-0 text-primary" />
              <span className="flex-1">{lesson.title}</span>
              <span className="text-xs text-muted-foreground">
                {formatDuration(lesson.duration)}
              </span>
            </button>
            <AnimatePresence>
              {isPlaying && (
                <Motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <video
                    src={lesson.videoUrl}
                    controls
                    autoPlay
                    className="aspect-video w-full bg-black"
                  />
                  {lesson.description && (
                    <p className="p-3 text-sm text-muted-foreground">
                      {lesson.description}
                    </p>
                  )}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default LessonList;
