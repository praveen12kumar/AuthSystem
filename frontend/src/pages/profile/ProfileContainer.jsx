import { useEffect, useState } from 'react';

import Header from '@/components/molecules/header/Header';
import ChangePasswordForm from '@/components/organisms/profile/ChangePasswordForm';
import ProfileForm from '@/components/organisms/profile/ProfileForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyProfile } from '@/hooks/apis/auth/useMyProfile';
import { useResetPassword } from '@/hooks/apis/auth/useResetPassword';
import { useUpdateProfile } from '@/hooks/apis/auth/useUpdateProfile';
import { useAuth } from '@/hooks/conext/useAuth';

const emptyForm = {
  firstName: '',
  lastName: '',
  about: '',
  phoneNumber: '',
  gender: '',
  dob: ''
};

const toDateInputValue = (dob) => (dob ? dob.slice(0, 10) : '');

const ProfileContainer = () => {
  const { auth, setAuth } = useAuth();
  const { profile, isLoading } = useMyProfile();
  const { updateProfile, isPending: isSavingProfile } = useUpdateProfile();
  const { resetPassword, isPending: isChangingPassword } = useResetPassword();

  const [form, setForm] = useState(emptyForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      about: profile.profile?.about || '',
      phoneNumber: profile.profile?.phoneNumber || '',
      gender: profile.profile?.gender || '',
      dob: toDateInputValue(profile.profile?.dob)
    });
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const response = await updateProfile({ ...form, avatar: avatarFile });
    setAvatarFile(null);

    const updatedUser = response?.data;
    if (updatedUser) {
      const mergedUser = {
        ...auth.user,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar
      };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setAuth({ ...auth, user: mergedUser });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError('Please fill all the fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setPasswordError('New password cannot be same as old password');
      return;
    }

    setPasswordError(null);
    await resetPassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Profile</h1>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <ProfileForm
                profile={profile}
                form={form}
                setForm={setForm}
                avatarFile={avatarFile}
                setAvatarFile={setAvatarFile}
                onSubmit={handleProfileSubmit}
                isPending={isSavingProfile}
              />
            </TabsContent>
            <TabsContent value="password" className="mt-6">
              <ChangePasswordForm
                formInput={passwordForm}
                setFormInput={setPasswordForm}
                validationError={passwordError}
                onSubmit={handlePasswordSubmit}
                isPending={isChangingPassword}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ProfileContainer;
