import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Products from './pages/Products'
import UsedProducts from './pages/UsedProducts'
import Service from './pages/Service'
import MyPage from './pages/MyPage'
import NotificationSettings from './pages/sub/NotificationSettings'
import ChatHistory from './pages/sub/ChatHistory'
import ServiceGuide from './pages/sub/ServiceGuide'
import ServiceRequest from './pages/sub/ServiceRequest'
import LinkitNews from './pages/sub/LinkitNews'
import WorkLog from './pages/sub/WorkLog'

function Layout() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/used" element={<UsedProducts />} />
        <Route path="/service" element={<Service />} />
        <Route path="/service/request" element={<ServiceRequest />} />
        <Route path="/service/notifications" element={<NotificationSettings />} />
        <Route path="/service/chat" element={<ChatHistory />} />
        <Route path="/service/guide" element={<ServiceGuide />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/my/worklog" element={<WorkLog />} />
        <Route path="/news" element={<LinkitNews />} />
        <Route path="/notifications" element={<NotificationSettings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
