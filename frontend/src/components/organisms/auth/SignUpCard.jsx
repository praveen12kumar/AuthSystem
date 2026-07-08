import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { useNavigate } from "react-router-dom";
import { TriangleAlert, CircleCheck } from "lucide-react";


const SignUpCard = ({
  isPending,
  isSuccess,
  error,
  signUpForm,
  setSignUpForm,
  validationErrors,
  onSignUpFormSubmit,
}) => {

    const navigate = useNavigate();
  return (
    <div className="w-full h-full">
      <Card>
        <CardHeader className="w-full flex flex-col items-center justify-between gap-4">
                <div className="w-full flex items-center justify-between gap-4">
                  <Button onClick={()=>navigate('/auth/signin')} className="flex-1 " variant="outline" size="lg">SignIn</Button>
                  <Button  className="flex-1 bg-zinc-200" variant="outline" size="lg">SignUp</Button>
                </div>
                <Separator className='mb-2'/>
                <CardTitle className="w-full text-center">SignUp to your Account</CardTitle>
                {
                  validationErrors &&(
                    <div className="flex items-center gap-2 bg-destructive/15 rounded-md mb-4 text-destructive-foreground w-full text-red-600 text-xs p-4">
                      <TriangleAlert className="size-4"/> <p>{validationErrors.message}</p>
                    </div>
                  )
                }
                {
                    error && (
                    <div className="flex items-center gap-2 bg-destructive/15 rounded-md mb-4 text-destructive-foreground w-full text-red-600 text-xs p-4">
                      <TriangleAlert className="size-4"/> <p>{error}</p>
                    </div>)
                }
                {
                    isSuccess && (
                        <div className="flex items-center gap-2 bg-emerald-100 rounded-md mb-4 text-destructive-foreground w-full text-emerald-800 text-xs p-4">
                          <CircleCheck className="size-4"/> <p>Successfully signed up. Please check your email for verification.</p>
                        </div>
                    )
                }
              </CardHeader>
        <CardContent className="space-y-2">
          <form className="space-y-2" onSubmit={onSignUpFormSubmit}>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  required
                  value={signUpForm?.firstName}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, firstName: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  value={signUpForm?.lastName}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, lastName: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={signUpForm?.email}
                onChange={(e) =>
                  setSignUpForm({ ...signUpForm, email: e.target.value })
                }
                disabled={isPending}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="**********"
                required
                value={signUpForm?.password}
                onChange={(e) =>
                  setSignUpForm({ ...signUpForm, password: e.target.value })
                }
                disabled={isPending}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="confirrmPassword"
                type="password"
                placeholder="**********"
                required
                value={signUpForm?.confirmPassword}
                onChange={(e) =>
                  setSignUpForm({
                    ...signUpForm,
                    confirmPassword: e.target.value,
                  })
                }
                disabled={isPending}
              />
            </div>
            <Separator className="my-4" />
            <Button 
                type="submit" 
                className="w-full" 
                size={"lg"}
                disabled={isPending}
                >
              {isPending ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <CardDescription className="w-full text-xs text-center text-muted-foreground">
            Already have an account? <span>Click on the Sign-In button.</span>{" "}
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpCard;
