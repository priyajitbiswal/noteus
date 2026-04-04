import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DocumentList from './pages/DocumentList'
import Editor from './pages/Editor'

import Home from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DocumentList />} />
        <Route path="/doc/:id" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  )
}
