import { ImagePlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import CreateTagDialog from '@/components/organisms/instructor/CreateTagDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const CourseForm = ({
  isEditMode,
  form,
  setForm,
  tags,
  existingThumbnail,
  thumbnailFile,
  setThumbnailFile,
  onSubmit,
  isPending
}) => {
  const [previewUrl, setPreviewUrl] = useState(existingThumbnail || null);

  useEffect(() => {
    if (!thumbnailFile) {
      setPreviewUrl(existingThumbnail || null);
      return;
    }
    const objectUrl = URL.createObjectURL(thumbnailFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnailFile, existingThumbnail]);

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {isEditMode ? 'Edit Course' : 'Create a New Course'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <label
              htmlFor="thumbnail"
              className={cn(
                'flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed bg-muted/40 transition-colors hover:bg-muted/60',
                previewUrl && 'border-solid p-0'
              )}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Thumbnail preview"
                  className="size-full object-cover"
                />
              ) : (
                <>
                  <ImagePlus className="size-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload a thumbnail
                  </span>
                </>
              )}
            </label>
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Complete React Developer Course"
              required
              minLength={3}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="What will students learn in this course?"
              required
              minLength={10}
              rows={5}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                value={form.discount}
                onChange={(e) =>
                  setForm({ ...form, discount: e.target.value })
                }
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              <CreateTagDialog onCreated={(tag) => toggleTag(tag._id)} />
            </div>
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tags exist yet - create one above.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = form.tags.includes(tag._id);
                  return (
                    <Badge
                      key={tag._id}
                      asChild
                      variant={selected ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-1.5 text-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTag(tag._id)}
                        aria-pressed={selected}
                      >
                        {tag.name}
                        {selected && <X className="size-3" />}
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            {form.tags.length === 0 && (
              <p className="text-xs text-destructive">
                Select at least one tag.
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || form.tags.length === 0}
          >
            {isPending
              ? 'Saving...'
              : isEditMode
                ? 'Save Changes'
                : 'Create Course & Add Curriculum'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CourseForm;
