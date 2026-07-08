import React, { useEffect, useState } from "react";

import SignUpCard from '@/components/organisms/auth/SignUpCard';
import { useSignUp } from "@/hooks/apis/auth/useSignUp";
import { useNavigate } from "react-router-dom";


const SignUpContainer = ()=>{

    const [signUpForm, setSignUpFrom] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
 
  const navigate = useNavigate();

  const [validationErrors, setValidationErrors] = useState(null);

  const {isPending, isSuccess, error, signUp} = useSignUp();
  

  async function onSignUpFormSubmit(e){
    e.preventDefault();
    //console.log("sign up data", signUpForm);
    if(!signUpForm.firstName || !signUpForm.lastName || !signUpForm.email || !signUpForm.password || !signUpForm.confirmPassword){
        //console.log("Please fill all the fields");
        setValidationErrors({
            message: "Please fill all the fields"});
        return;
    }

    if(signUpForm.password !== signUpForm.confirmPassword){
        //console.log("Password and confirm password do not match");
        setValidationErrors({
            message: "Passwords do not match"});
        return;
    }

    setValidationErrors(null);

    await signUp(signUpForm);
  }  


  useEffect(()=>{
    if(isSuccess){
        navigate('/auth/otp', {
          state:{
            email: signUpForm.email,
            firstName: signUpForm.firstName,
            lastName: signUpForm.lastName,
            password: signUpForm.password
          }
        });
    }
  },[isSuccess]);

  return(
    <>
        <SignUpCard 
            error={error}
            isPending={isPending}
            isSuccess={isSuccess}
            signUpForm={signUpForm} 
            setSignUpForm={setSignUpFrom}
            validationErrors={validationErrors}
            onSignUpFormSubmit={onSignUpFormSubmit}
        />
    </>
  )
};

export default SignUpContainer;