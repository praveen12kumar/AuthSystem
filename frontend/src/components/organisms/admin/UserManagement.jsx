import { motion as Motion } from 'framer-motion';
import { useState } from 'react';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const UserRow = ({ user, isSelf, onUpdateRole, isSaving }) => {
  const [pendingRole, setPendingRole] = useState(user.role);
  const hasChange = pendingRole !== user.role;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.firstName} />
          <AvatarFallback>
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {user.firstName} {user.lastName} {isSelf && <Badge variant="secondary">You</Badge>}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>

        {isSelf ? (
          <Badge variant="outline">{user.role}</Badge>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Select value={pendingRole} onValueChange={setPendingRole} disabled={isSaving}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">STUDENT</SelectItem>
                <SelectItem value="INSTRUCTOR">INSTRUCTOR</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={!hasChange || isSaving}>
                  Save
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Change role?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.firstName} {user.lastName} will change from{' '}
                    <strong>{user.role}</strong> to <strong>{pendingRole}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPendingRole(user.role)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => onUpdateRole(user._id, pendingRole)}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const UserManagement = ({ users, isLoading, currentUserId, onUpdateRole, isSaving }) => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="mt-1 text-muted-foreground">
          {isLoading ? 'Loading users...' : `${users.length} user${users.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {users.map((user) => (
            <Motion.div key={user._id} variants={itemVariants}>
              <UserRow
                user={user}
                isSelf={user._id === currentUserId}
                onUpdateRole={onUpdateRole}
                isSaving={isSaving}
              />
            </Motion.div>
          ))}
        </Motion.div>
      )}
    </div>
  );
};

export default UserManagement;
