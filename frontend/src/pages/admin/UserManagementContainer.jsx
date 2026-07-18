import Header from '@/components/molecules/header/Header';
import UserManagement from '@/components/organisms/admin/UserManagement';
import { useAllUsers } from '@/hooks/apis/auth/useAllUsers';
import { useUpdateUserRole } from '@/hooks/apis/auth/useUpdateUserRole';
import { useAuth } from '@/hooks/conext/useAuth';

const UserManagementContainer = () => {
  const { auth } = useAuth();
  const { users, isLoading } = useAllUsers();
  const { updateUserRole, isPending } = useUpdateUserRole();

  const handleUpdateRole = async (id, role) => {
    try {
      await updateUserRole({ id, role });
    } catch {
      // toast already handled in useUpdateUserRole
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <UserManagement
        users={users}
        isLoading={isLoading}
        currentUserId={auth.user?.id}
        onUpdateRole={handleUpdateRole}
        isSaving={isPending}
      />
    </div>
  );
};

export default UserManagementContainer;
