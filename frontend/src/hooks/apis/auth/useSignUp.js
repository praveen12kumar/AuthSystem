import { useMutation } from "@tanstack/react-query";
import { signUpRequest } from "@/apis/auth";
import toast from "react-hot-toast";

export const useSignUp = () => {
  const {
    mutateAsync: signUpMutation,
    isPending,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: signUpRequest,
    onSuccess: (data) => {
      toast.success("✅ Please verify your email! ");
    },
    onError: (err) => {
      toast.error("❌"+ err || "Something went wrong! ");
    },
  });

  return {
    isPending,
    isSuccess,
    error,         
    signUp: signUpMutation, // promise style
  };
};
