import React, { useEffect } from 'react'
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OneTimePassword from '../../components/organisms/auth/OneTimePassword';
import { useVerifyEmail } from '@/hooks/apis/auth/useVerifyEmail';

const OneTimePasswordContainer = () => {
  const [value, setValue] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const {email, firstName, lastName, password} = location.state || {};

  const {isPending, isSuccess, error, verifyEmail} = useVerifyEmail();


  const onComplete = async()=>{
    const response = await verifyEmail({email, firstName, lastName, password, otp: value});
    console.log("response", response);
  }

  useEffect(()=>{
    if(isSuccess){
        navigate('/auth/signin');
    }
  },[isSuccess])
  
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

export default OneTimePasswordContainer