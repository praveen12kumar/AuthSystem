import { useMemo } from 'react';

import Header from '@/components/molecules/header/Header';
import TagManagement from '@/components/organisms/instructor/TagManagement';
import { useCourses } from '@/hooks/apis/course/useCourses';
import { useCreateTag } from '@/hooks/apis/tag/useCreateTag';
import { useDeleteTag } from '@/hooks/apis/tag/useDeleteTag';
import { useTags } from '@/hooks/apis/tag/useTags';
import { useUpdateTag } from '@/hooks/apis/tag/useUpdateTag';

const TagManagementContainer = () => {
  const { tags, isLoading: tagsLoading } = useTags();
  const { courses } = useCourses();
  const { createTag, isPending: isCreating } = useCreateTag();
  const { updateTag, isPending: isUpdating } = useUpdateTag();
  const { deleteTag, isPending: isDeleting } = useDeleteTag();

  const usageCounts = useMemo(() => {
    const counts = {};
    for (const course of courses) {
      for (const tagId of course.tags || []) {
        counts[tagId] = (counts[tagId] || 0) + 1;
      }
    }
    return counts;
  }, [courses]);

  const handleCreate = async ({ name, description }) => {
    try {
      await createTag({ name, description });
    } catch {
      // toast already handled in useCreateTag
    }
  };

  const handleUpdate = async (id, { name, description }) => {
    try {
      await updateTag({ id, name, description });
    } catch {
      // toast already handled in useUpdateTag
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTag({ id });
    } catch {
      // toast already handled in useDeleteTag
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <TagManagement
        tags={tags}
        isLoading={tagsLoading}
        usageCounts={usageCounts}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isSaving={isCreating || isUpdating}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default TagManagementContainer;
