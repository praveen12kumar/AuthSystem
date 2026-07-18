import {Route,Routes} from 'react-router-dom';

import ProtectedRoute from '@/components/molecules/protectRoute/ProtectedRoute';
import Auth from '@/pages/auth/Auth';
import ChangePasswordContainer from '@/pages/auth/ChangePasswordContainer';
import ForgotPasswordContainer from '@/pages/auth/ForgotPasswordContainer';
import ForgotPasswordOtpVerificationContainer from '@/pages/auth/ForgotPasswordOtpVerificationContainer';
import OneTimePasswordContainer from '@/pages/auth/OneTimePasswordContainer';
import ResetPasswordContainer from '@/pages/auth/ResetPasswordContainer';
import SignInContainer from '@/pages/auth/SignInContainer';
import SignUpContainer  from '@/pages/auth/SignUpContainer';
import CourseCatalogContainer from '@/pages/course/CourseCatalogContainer';
import CourseDetailContainer from '@/pages/course/CourseDetailContainer';
import Home from '@/pages/home/Home';
import CourseFormContainer from '@/pages/instructor/CourseFormContainer';
import InstructorDashboardContainer from '@/pages/instructor/InstructorDashboardContainer';
import NotFound from '@/pages/notFound/NotFound';
import MyPurchasesContainer from '@/pages/purchases/MyPurchasesContainer';

const INSTRUCTOR_ROLES = ['ADMIN', 'INSTRUCTOR'];




export const AppRoutes = ()=>{
    return(
        <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/courses' element={<CourseCatalogContainer/>}/>
        <Route path='/courses/:id' element={<CourseDetailContainer/>}/>
        <Route path='/my-purchases' element={<ProtectedRoute><MyPurchasesContainer/></ProtectedRoute>}/>
        <Route path='/instructor/courses' element={<ProtectedRoute roles={INSTRUCTOR_ROLES}><InstructorDashboardContainer/></ProtectedRoute>}/>
        <Route path='/instructor/courses/new' element={<ProtectedRoute roles={INSTRUCTOR_ROLES}><CourseFormContainer/></ProtectedRoute>}/>
        <Route path='/instructor/courses/:id/edit' element={<ProtectedRoute roles={INSTRUCTOR_ROLES}><CourseFormContainer/></ProtectedRoute>}/>
        <Route path='/auth/signin' element={<Auth> <SignInContainer/></Auth>}/>
        <Route path='/auth/signup' element={<Auth> <SignUpContainer/></Auth>}/>
        <Route path='/auth/otp' element={ <Auth><OneTimePasswordContainer/></Auth>}/>
        <Route path='/auth/forgot-password' element={<Auth><ForgotPasswordContainer/></Auth>}/>
        <Route path="/auth/change-password" element={<Auth><ChangePasswordContainer/></Auth>}/>
        <Route path='/auth/reset-password' element={<ProtectedRoute><Auth><ResetPasswordContainer/></Auth></ProtectedRoute>}/>
        <Route path='/auth/forgot-password/otp' element={<Auth><ForgotPasswordOtpVerificationContainer/></Auth>}/>
        <Route path='/*' element={<NotFound/>}/>
      </Routes>
    );
};