import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ChangePasswordForm = ({
  formInput,
  setFormInput,
  validationError,
  onSubmit,
  isPending
}) => {
  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-4">
      {validationError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          <p>{validationError}</p>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="oldPassword">Old password</Label>
        <Input
          id="oldPassword"
          type="password"
          value={formInput.oldPassword}
          onChange={(e) => setFormInput({ ...formInput, oldPassword: e.target.value })}
          disabled={isPending}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          value={formInput.newPassword}
          onChange={(e) => setFormInput({ ...formInput, newPassword: e.target.value })}
          disabled={isPending}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formInput.confirmPassword}
          onChange={(e) =>
            setFormInput({ ...formInput, confirmPassword: e.target.value })
          }
          disabled={isPending}
          required
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update password'}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
