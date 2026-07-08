import React, { useEffect, useState } from 'react'
import OneTimePassword from '@/components/organisms/auth/OneTimePassword';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useVerifyOtp } from '@/hooks/apis/auth/useVerifyOtp';

const ForgotPasswordOtpVerificationContainer = () => {
    const [value, setValue] = useState("");
    const location = useLocation();
    const {email} = location.state || {};

    const navigate = useNavigate();

    const {isPending, isSuccess, error, verifyOtp} = useVerifyOtp();
    
    async function onComplete(){
       console.log("value", value);
       const response = await verifyOtp({email, otp: value});
       console.log("response", response);
    }
    
    useEffect(()=>{
      if(isSuccess){
        navigate('/auth/change-password', {
          state:{
            email: email,
          }
        });
      }
    },[isSuccess]);


  return (
    <>
    <OneTimePassword
        value={value}
        setValue={setValue}
        onComplete={onComplete}
        isPending={isPending}
        isSuccess={isSuccess}
        error={error}
        email={email}
    />
    </>
  )
}

export default ForgotPasswordOtpVerificationContainer;