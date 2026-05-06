import React from 'react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "The Future of Artificial Intelligence",
    excerpt: "Explore how AI is transforming industries and reshaping our world, from healthcare to transportation.",
    date: "2024-01-15",
    author: "John Doe"
  },
  {
    id: 2,
    title: "Sustainable Living: A Practical Guide",
    excerpt: "Learn actionable strategies to reduce your environmental impact and live more sustainably.",
    date: "2024-01-20",
    author: "Jane Smith"
  },
  {
    id: 3,
    title: "Mindfulness in the Digital Age",
    excerpt: "Discover techniques to find peace and clarity in our hyper-connected, technology-driven world.",
    date: "2024-01-25",
    author: "Mike Johnson"
  },
  {
    id: 4,
    title: "The Art of Productive Remote Work",
    excerpt: "Master the strategies and tools needed to thrive while working from home effectively.",
    date: "2024-02-01",
    author: "Sarah Wilson"
  }
];

function BlogList() {
  return (
    <div className="blog-list">
      <h1>Recent Articles</h1>
      <p>Explore the latest insights on technology, sustainability, and personal growth</p>
      <div className="posts-grid">
        {blogPosts.map(post => (
          <article key={post.id} className="post-card">
            <div className="post-content-wrapper">
              <h2 className="post-title">
                <Link to={`/post/${post.id}`}>{post.title}</Link>
              </h2>
              <p className="post-meta">
                By {post.author} on {new Date(post.date).toLocaleDateString()}
              </p>
              <p className="post-excerpt">{post.excerpt}</p>
            </div>
            <Link to={`/post/${post.id}`} className="read-more">
              Continue Reading
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default BlogList;
