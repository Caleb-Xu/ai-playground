import { Route, Routes } from 'react-router-dom'
import { ChatBox } from './components/ChatBox'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🤖 AI Playground</h1>
      <Routes>
        <Route path="/" element={<ChatBox />} />
        <Route path="/chat/:conversationId" element={<ChatBox />} />
      </Routes>
    </div>
  )
}

export default App
