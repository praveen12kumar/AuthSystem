import {Route,Routes} from 'react-router-dom';

import ProtectedRoute from '@/components/molecules/protectRoute/ProtectedRoute';
import UserManagementContainer from '@/pages/admin/UserManagementContainer';
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
import CoursePlayerContainer from '@/pages/course/CoursePlayerContainer';
import Home from '@/pages/home/Home';
import CourseFormContainer from '@/pages/instructor/CourseFormContainer';
import EarningsContainer from '@/pages/instructor/EarningsContainer';
import InstructorDashboardContainer from '@/pages/instructor/InstructorDashboardContainer';
import TagManagementContainer from '@/pages/instructor/TagManagementContainer';
import NotFound from '@/pages/notFound/NotFound';
import ProfileContainer from '@/pages/profile/ProfileContainer';
import MyPurchasesContainer from '@/pages/purchases/MyPurchasesContainer';

const INSTRUCTOR_ROLES = ['ADMIN', 'INSTRUCTOR'];
const ADMIN_ROLES = ['ADMIN'];




export const AppRoutes = ()=>{
    return(
        <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/courses' element={<CourseCatalogContainer/>}/>
        <Route path='/courses/:id' element={<CourseDetailContainer/>}/>
        <Route path='/courses/:id/learn' element={<ProtectedRoute><CoursePlayerContainer/></ProtectedRoute>}/>
        <Route path='/courses/:id/learn/:subSectionId' element={<ProtectedRoute><CoursePlayerContainer/></ProtectedRoute>}/>
        <Route path='/my-purchases' element={<ProtectedRoute><MyPurchasesContainer/></ProtectedRoute>}/>
        <Route path='/profile' element={<ProtectedRoute><ProfileContainer/></ProtectedRoute>}/>
        <Route path='/instructor/courses' element={<ProtectedRoute roles={INSTRUCTOR_ROLES}><InstructorDashboardContainer/></ProtectedRoute>}/>
        <Route path='/instructor/earnings' element={<ProtectedRoute roles={INSTRUCTOR_ROLES}><EarningsContainer/></ProtectedRoute>}/>
        <Route path='/instructor/tags' element={<ProtectedRoute roles={INSTRUCTOR_ROLES}><TagManagementContainer/></ProtectedRoute>}/>
        <Route path='/admin/users' element={<ProtectedRoute roles={ADMIN_ROLES}><UserManagementContainer/></ProtectedRoute>}/>
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