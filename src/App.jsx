import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import MediaUpload from './pages/MediaUpload'
import MessageSender from './pages/MessageSender'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">WhatsApp Marketing SaaS</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Media Upload</Link>
              <Link to="/send-messages" className="nav-link">Send Messages</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<MediaUpload />} />
            <Route path="/send-messages" element={<MessageSender />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
