import { Camera } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const ProfileForm = ({
  profile,
  form,
  setForm,
  avatarFile,
  setAvatarFile,
  onSubmit,
  isPending
}) => {
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar || null);

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(profile?.avatar || null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatarFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile, profile?.avatar]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <label htmlFor="avatar" className="group relative cursor-pointer">
          <Avatar className="size-20">
            <AvatarImage src={previewUrl} alt={form.firstName} />
            <AvatarFallback>
              {form.firstName?.[0]}
              {form.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-5 text-white" />
          </span>
        </label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
        <div className="text-sm text-muted-foreground">
          Click your avatar to change it
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            disabled={isPending}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            disabled={isPending}
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile?.email || ''} disabled readOnly />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <Input
            id="phoneNumber"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            disabled={isPending}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="gender">Gender</Label>
        <Select
          value={form.gender}
          onValueChange={(value) => setForm({ ...form, gender: value })}
          disabled={isPending}
        >
          <SelectTrigger id="gender" className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="about">About</Label>
        <Textarea
          id="about"
          rows={4}
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
          disabled={isPending}
          placeholder="Tell us a bit about yourself"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  );
};

export default ProfileForm;
