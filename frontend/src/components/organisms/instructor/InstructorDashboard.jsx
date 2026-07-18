import { motion as Motion } from 'framer-motion';
import { Layers, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  show: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

const InstructorDashboard = ({ courses, isLoading, onDelete, isDeleting }) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="mt-1 text-muted-foreground">
            Create, edit and manage your published courses
          </p>
        </div>
        <Button asChild>
          <Link to="/instructor/courses/new">
            <Plus /> New Course
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Layers className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">No courses yet</h3>
              <p className="text-sm text-muted-foreground">
                Publish your first course to start teaching.
              </p>
            </div>
            <Button asChild>
              <Link to="/instructor/courses/new">
                <Plus /> Create your first course
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {courses.map((course) => (
            <Motion.div key={course._id} variants={itemVariants}>
              <Card>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-24 w-full rounded-lg object-cover sm:w-40"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{course.title}</h3>
                      {course.discount > 0 && (
                        <Badge variant="destructive">
                          {course.discount}% off
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        ${course.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {course.studentsEnrolled?.length || 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="size-3.5" />
                        {course.sections?.length || 0} sections
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/instructor/courses/${course._id}/edit`}>
                        <Pencil /> Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Delete ${course.title}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete course?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{course.title}" and
                            all of its sections. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => onDelete(course._id)}
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
          ))}
        </Motion.div>
      )}
    </div>
  );
};

export default InstructorDashboard;
