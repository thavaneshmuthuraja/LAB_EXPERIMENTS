import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BlogList from './components/BlogList.jsx';
import BlogPost from './components/BlogPost.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <nav className="nav">
            <Link to="/" className="nav-brand">TechBlog</Link>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
        </header>
        
        <main className="main">
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/post/:id" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>&copy; 2024 TechBlog. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
