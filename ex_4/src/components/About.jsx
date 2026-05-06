import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="about-page">
      <h1>About TechBlog</h1>
      <p>Learn more about our mission and the team behind the content</p>
      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            TechBlog is a platform dedicated to sharing knowledge and experiences 
            about web development, particularly focusing on React and modern JavaScript technologies.
          </p>
        </section>
        
        <section className="about-section">
          <h2>What We Cover</h2>
          <ul className="topics-list">
            <li>React fundamentals and advanced concepts</li>
            <li>JavaScript best practices</li>
            <li>Web development tools and workflows</li>
            <li>Frontend architecture and design patterns</li>
            <li>Performance optimization techniques</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <h3>John Doe</h3>
              <p>React enthusiast with 5+ years of experience</p>
            </div>
            <div className="team-member">
              <h3>Jane Smith</h3>
              <p>Frontend architect and performance expert</p>
            </div>
            <div className="team-member">
              <h3>Mike Johnson</h3>
              <p>JavaScript specialist and educator</p>
            </div>
            <div className="team-member">
              <h3>Sarah Wilson</h3>
              <p>CSS and UI/UX design professional</p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Get in Touch</h2>
          <p>
            We love hearing from our readers! Whether you have questions, suggestions, 
            or want to contribute content, feel free to reach out.
          </p>
          <Link to="/contact" className="cta-button">Get in Touch</Link>
        </section>
      </div>
    </div>
  );
}

export default About;
