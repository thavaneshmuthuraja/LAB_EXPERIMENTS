import React, { useRef } from 'react';

function Contact() {
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData);
    console.log('Form submitted:', data);
    alert('Thank you for your message. We will respond to you shortly.');
    formRef.current.reset();
  };

  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <p>Get in touch with our team for questions and feedback</p>
      <div className="contact-content">
        <section className="contact-info">
          <h2>Get in Touch</h2>
          <p>
            We'd love to hear from you! Whether you have a question, feedback, 
            or just want to say hello, feel free to reach out.
          </p>
          
          <div className="contact-methods">
            <div className="contact-method">
              <h3>Email</h3>
              <p>hello@simpleblog.com</p>
            </div>
            <div className="contact-method">
              <h3>Twitter</h3>
              <p>@simpleblog</p>
            </div>
            <div className="contact-method">
              <h3>GitHub</h3>
              <p>github.com/simpleblog</p>
            </div>
          </div>
        </section>
        
        <section className="contact-form-section">
          <h2>Send a Message</h2>
          <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Your Name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                required 
                placeholder="What's this about?"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea 
                id="message" 
                name="message" 
                required 
                rows="6"
                placeholder="Tell us what's on your mind..."
              ></textarea>
            </div>
            
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Contact;
