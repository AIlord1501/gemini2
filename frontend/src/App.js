import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CareerPath from './pages/CareerPath';
import Roadmap from './pages/Roadmap';
import Courses from './pages/Courses';
import MockTest from './pages/MockTest';
import Resources from './pages/Resources';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/career-path" element={<CareerPath />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/mock-test" element={<MockTest />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <ChatBot />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
