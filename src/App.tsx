import { Navigate, Route, Routes } from 'react-router-dom'
import { ContentProvider } from './content'
import { Home, Layout, NotFound, ProjectPage, Services, Work } from './pages'
export default function App() {
  return (
    <Routes>
      <Route element={<ContentProvider><Layout /></ContentProvider>}>
        <Route index element={<Home />} />
        <Route path="work" element={<Work />} />
        <Route path="work/:slug" element={<ProjectPage />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<Navigate to="/#about" replace />} />
        <Route path="contact" element={<Navigate to="/#contact" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
