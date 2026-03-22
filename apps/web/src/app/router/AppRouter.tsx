import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '../../pages/HomePage'
import { RegisterPage } from '../../pages/RegisterPage'
import { LoginPage } from '../../pages/LoginPage'
import { MePage } from '../../pages/MePage'
import { CoursesPage } from '../../pages/CoursesPage/CoursesPage.tsx'
import { CoursePage } from '../../pages/CoursePage/CoursePage.tsx'
import { MyCoursesPage } from '../../pages/MyCoursesPage/MyCoursesPage'
import { CreateCoursePage } from '../../pages/CreateCoursePage/CreateCoursePage'
import { RequireAuth } from '../../features/auth-guard/RequireAuth'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/courses' element={<CoursesPage />} />
        <Route path='/courses/:id' element={<CoursePage />} />
        <Route element={<RequireAuth />}>
          <Route path="/me" element={<MePage />} />
          <Route path='/my-courses' element={<MyCoursesPage />} />
          <Route path="/courses/create" element={<CreateCoursePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}