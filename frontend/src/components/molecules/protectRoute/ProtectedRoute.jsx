import { LucideLoader2 } from 'lucide-react';
import React  from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/conext/useAuth';

const ProtectedRoute = ({children, roles}) => {
    const {auth} = useAuth();

    // is the loading state becomes false, then re-render the component


    if(auth.isLoading){
        return <div className='h-screen flex items-center justify-center'>
            <LucideLoader2 className='animate-spin' size={50}/>
        </div>;
    }

    if(!auth.user || !auth.token){
        return <Navigate to='/auth/signin'/>;
    }

    if(roles && !roles.includes(auth.user.role)){
        return <Navigate to='/'/>;
    }

    return children;

};

export default ProtectedRoute;