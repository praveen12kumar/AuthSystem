import { motion as Motion } from 'framer-motion';
import { ArrowRight, BookOpen, Layers, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import Header from '@/components/molecules/header/Header';
import CourseCard from '@/components/organisms/course/CourseCard';
import CourseCardSkeleton from '@/components/organisms/course/CourseCardSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCourses } from '@/hooks/apis/course/useCourses';
import { useTags } from '@/hooks/apis/tag/useTags';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Home = () => {
  const { courses, isLoading: coursesLoading } = useCourses();
  const { tags, isLoading: tagsLoading } = useTags();

  const tagMap = Object.fromEntries(tags.map((tag) => [tag._id, tag.name]));
  const featuredCourses = courses.slice(0, 6);
  const instructorCount = new Set(courses.map((c) => c.instructor)).size;

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] size-[28rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-[10%] right-[-10%] size-[24rem] rounded-full bg-chart-2/20 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 md:py-28">
          <Motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Sparkles className="size-3.5" /> Learn from real instructors
            </Badge>
          </Motion.div>

          <Motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            Master new skills with courses built by{' '}
            <span className="text-primary">real practitioners</span>
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl text-lg text-muted-foreground"
          >
            Browse a growing catalog of courses, or start teaching what you
            know and reach students around the world.
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg">
              <Link to="/courses">
                Explore Courses <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth/signup">Become an Instructor</Link>
            </Button>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 grid w-full max-w-2xl grid-cols-3 gap-4 border-t pt-8"
          >
            <div className="flex flex-col items-center gap-1">
              <BookOpen className="size-5 text-primary" />
              <span className="text-2xl font-bold">{courses.length}</span>
              <span className="text-xs text-muted-foreground">Courses</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users className="size-5 text-primary" />
              <span className="text-2xl font-bold">{instructorCount}</span>
              <span className="text-xs text-muted-foreground">
                Instructors
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Layers className="size-5 text-primary" />
              <span className="text-2xl font-bold">{tags.length}</span>
              <span className="text-xs text-muted-foreground">
                Categories
              </span>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Featured Courses
            </h2>
            <p className="text-muted-foreground">
              Fresh picks from our course catalog
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/courses">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>

        {coursesLoading || tagsLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
            No courses published yet — check back soon.
          </div>
        ) : (
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featuredCourses.map((course) => (
              <Motion.div key={course._id} variants={itemVariants}>
                <CourseCard course={course} tagMap={tagMap} />
              </Motion.div>
            ))}
          </Motion.div>
        )}
      </section>

      {/* Browse by category */}
      {tags.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">
              Browse by Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag._id} to={`/courses?tag=${tag._id}`}>
                  <Badge
                    variant="outline"
                    className="px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to start learning?
          </h2>
          <p className="max-w-md text-primary-foreground/80">
            Create a free account and get access to every course in the
            catalog.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-2"
          >
            <Link to="/auth/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
