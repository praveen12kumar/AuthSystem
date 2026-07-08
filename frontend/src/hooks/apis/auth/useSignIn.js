import { useMutation } from "@tanstack/react-query";

import { signInRequest} from "@/apis/auth";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/conext/useAuth";

export const useSignIn = () =>{
    const {setAuth} = useAuth();

    const {isPending, isSuccess, error, mutateAsync:signInMutution} = useMutation({
        // from the UI we call this mutate function, this will trigger the signInRequest function
        mutationFn: signInRequest,
        onSuccess: (response)=>{
            console.log("Success sign in", response);
            const userObject = JSON.stringify(response.data);
            localStorage.setItem("user", userObject);
            localStorage.setItem("token", response.data.token);

            setAuth({
                user: response.data,
                token: response.data.token,
                isLoading: false
            });


            toast.success("Signed in successfully");
        },
        onError: (error) =>{
            console.log("Error sign in", error);
            toast.error(error || "Something went wrong");
        }
    });

    return {
        isPending,
        isSuccess,
        error,
        signIn: signInMutution
    }
};