import React from 'react';

import Header from '@/components/molecules/header/Header';

const Auth = ({children}) => {
  return (
    <div className="min-h-dvh flex flex-col bg-muted/40">
      <Header/>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full md:w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Auth;
