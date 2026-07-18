import { motion as Motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/conext/useAuth';

const Header = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const { user } = auth;
  const canTeach = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuth({ user: null, token: null, isLoading: false });
    navigate('/');
  };

  return (
    <Motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">LMS</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/courses">
              <BookOpen /> Explore Courses
            </Link>
          </Button>
          {canTeach && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/instructor/courses">
                <LayoutDashboard /> Dashboard
              </Link>
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {auth.isLoading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  aria-label="Open account menu"
                  className="h-auto gap-2 rounded-full px-2 py-1"
                >
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.firstName} />
                    <AvatarFallback>
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">
                    {user.firstName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <span className="font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                  <Badge variant="secondary" className="mt-1 w-fit">
                    {user.role}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/courses">
                    <BookOpen /> Explore Courses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-purchases">
                    <ShoppingBag /> My Purchases
                  </Link>
                </DropdownMenuItem>
                {canTeach && (
                  <DropdownMenuItem asChild>
                    <Link to="/instructor/courses">
                      <LayoutDashboard /> Instructor Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/auth/change-password">
                    <User /> Change Password
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  <LogOut /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth/signin')}
              >
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/auth/signup')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </Motion.header>
  );
};

export default Header;
