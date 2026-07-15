import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/molecules/header/Header';
import CourseForm from '@/components/organisms/instructor/CourseForm';
import SectionManager from '@/components/organisms/instructor/SectionManager';
import { useCourse } from '@/hooks/apis/course/useCourse';
import { useCreateCourse } from '@/hooks/apis/course/useCreateCourse';
import { useUpdateCourse } from '@/hooks/apis/course/useUpdateCourse';
import { useTags } from '@/hooks/apis/tag/useTags';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  discount: '',
  tags: []
};

const CourseFormContainer = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { course, isLoading: courseLoading } = useCourse(id);
  const { tags } = useTags();
  const { createCourse, isPending: isCreating } = useCreateCourse();
  const { updateCourse, isPending: isUpdating } = useUpdateCourse();

  const [form, setForm] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (isEditMode && course) {
      setForm({
        title: course.title,
        description: course.description,
        price: course.price,
        discount: course.discount || 0,
        tags: course.tags || []
      });
    }
  }, [isEditMode, course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: form.price,
      discount: form.discount || 0,
      tags: form.tags,
      thumbnail: thumbnailFile
    };

    try {
      if (isEditMode) {
        await updateCourse({ id, ...payload });
      } else {
        const response = await createCourse(payload);
        navigate(`/instructor/courses/${response.data._id}/edit`);
        return;
      }
    } catch {
      // toast already handled in the mutation hooks
    }
  };

  if (isEditMode && courseLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">
          Loading course...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">
        <CourseForm
          isEditMode={isEditMode}
          form={form}
          setForm={setForm}
          tags={tags}
          existingThumbnail={course?.thumbnail}
          thumbnailFile={thumbnailFile}
          setThumbnailFile={setThumbnailFile}
          onSubmit={handleSubmit}
          isPending={isCreating || isUpdating}
        />
        {isEditMode && course && <SectionManager courseId={course._id} />}
      </div>
    </div>
  );
};

export default CourseFormContainer;
