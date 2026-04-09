import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Journal from './pages/Journal'
import MemoryDetail from './pages/MemoryDetail'
import Upload from './pages/Upload'
import Gallery from './pages/Gallery'
import Settings from './pages/Settings'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-ink dark:bg-[#140C0C] dark:text-[#F7EEE8]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal/:id"
          element={
            <ProtectedRoute>
              <MemoryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

