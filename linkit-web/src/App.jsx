import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SemiDealerLanding from './pages/semi-dealer/SemiDealerLanding'
import SemiDealerApply from './pages/semi-dealer/SemiDealerApply'
import SemiDealerDashboard from './pages/semi-dealer/SemiDealerDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/semi-dealer" element={<SemiDealerLanding />} />
        <Route path="/semi-dealer/apply" element={<SemiDealerApply />} />
        <Route path="/semi-dealer/dashboard" element={<SemiDealerDashboard />} />
        <Route path="*" element={<Navigate to="/semi-dealer" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
