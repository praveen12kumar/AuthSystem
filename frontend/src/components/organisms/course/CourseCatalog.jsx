import { motion as Motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

import CourseCard from '@/components/organisms/course/CourseCard';
import CourseCardSkeleton from '@/components/organisms/course/CourseCardSkeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const CourseCatalog = ({
  courses,
  tagMap,
  tags,
  activeTag,
  onTagSelect,
  search,
  onSearchChange,
  isLoading
}) => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Explore Courses</h1>
        <p className="mt-1 text-muted-foreground">
          {isLoading ? 'Loading catalog...' : `${courses.length} course${courses.length === 1 ? '' : 's'} available`}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses..."
            className="pl-9"
          />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag._id}
                onClick={() => onTagSelect(tag._id)}
                variant={activeTag === tag._id ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer px-3 py-1.5 text-sm',
                  activeTag === tag._id
                    ? ''
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {tag.name}
                {activeTag === tag._id && <X className="size-3" />}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          No courses match your search.
        </div>
      ) : (
        <Motion.div
          key={`${search}-${activeTag}`}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {courses.map((course) => (
            <Motion.div key={course._id} variants={itemVariants}>
              <CourseCard course={course} tagMap={tagMap} />
            </Motion.div>
          ))}
        </Motion.div>
      )}
    </div>
  );
};

export default CourseCatalog;
