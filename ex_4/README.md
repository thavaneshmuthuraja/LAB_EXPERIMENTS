# Simple Blog - React Website

A simple blog website built with React components, routing, refs, and CSS styling.

## Features

- **Multiple Pages**: Home (blog list), individual blog posts, About, and Contact pages
- **React Router**: Client-side routing for navigation between pages
- **Styled Components**: Clean, responsive CSS styling
- **React Hooks**: useState, useEffect, and useRef for state management and DOM manipulation
- **Form Handling**: Contact form with validation
- **Responsive Design**: Mobile-friendly layout

## Project Structure

```
simple-blog/
|-- index.html              # Main HTML entry point
|-- package.json            # Project dependencies
|-- src/
|   |-- App.js              # Main App component with routing
|   |-- styles.css          # CSS styling
|   |-- components/
|   |   |-- BlogList.js     # Blog list component
|   |   |-- BlogPost.js     # Individual blog post component
|   |   |-- About.js        # About page component
|   |   |-- Contact.js      # Contact page component
|-- README.md               # This file
```

## Getting Started

### Method 1: Using the HTML file (Simplest)

1. Open `index.html` in your web browser
2. The blog will work immediately using CDN links for React

### Method 2: Using Node.js (Development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open `http://localhost:3000` in your browser

## Components

### App.js
- Main application component
- Sets up React Router
- Contains header navigation and footer

### BlogList.js
- Displays list of blog posts
- Uses grid layout for responsive design
- Links to individual blog posts

### BlogPost.js
- Shows individual blog post content
- Uses useRef for smooth scrolling
- Handles dynamic routing with useParams

### About.js
- About page with team information
- Uses lists and grid layouts
- Links to contact page

### Contact.js
- Contact form with validation
- Uses useRef for form handling
- Displays contact information

## Technologies Used

- **React 18**: Component-based UI library
- **React Router DOM**: Client-side routing
- **CSS3**: Styling and responsive design
- **Babel Standalone**: In-browser JSX transformation (for HTML method)

## Routing

- `/` - Blog list (home page)
- `/post/:id` - Individual blog post
- `/about` - About page
- `/contact` - Contact page

## Styling Features

- Responsive grid layouts
- Hover effects and transitions
- Mobile-first design
- Clean typography
- Card-based design for blog posts

## Running the Project

The blog can be run in two ways:

1. **Direct HTML**: Simply open `index.html` in a browser
2. **Development Server**: Use `npm start` for a local development server

Both methods provide the same functionality, with the HTML method being the simplest approach.
