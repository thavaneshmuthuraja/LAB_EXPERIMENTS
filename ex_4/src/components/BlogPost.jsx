import React, { useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const fullPosts = {
  1: {
    title: "The Future of Artificial Intelligence",
    content: `Artificial Intelligence is transforming industries worldwide. From healthcare diagnostics to autonomous vehicles, AI is becoming integral to daily life. Machine learning enables systems to learn from data and improve over time. While promising, AI raises important ethical questions about bias, privacy, and job displacement. The future holds tremendous potential with advances in quantum computing and neural networks. Responsible development remains crucial as we navigate this technological revolution.`,
    date: "2024-01-15",
    author: "John Doe"
  },
  2: {
    title: "Sustainable Living: A Practical Guide",
    content: `Sustainable living reduces environmental impact for future generations. Simple changes like switching to LED bulbs and unplugging devices conserve energy. The three Rs—reduce, reuse, recycle—help minimize waste effectively. Choose public transportation, bike, or walk when possible to lower emissions. Eco-friendly diet choices, such as reducing meat consumption, make a significant difference. Water conservation through efficient fixtures and mindful usage preserves precious resources. Start small and gradually build sustainable habits into your daily routine.`,
    date: "2024-01-20",
    author: "Jane Smith"
  },
  3: {
    title: "Mindfulness in the Digital Age",
    content: `Mindfulness is being fully present in the current moment without judgment. In our hyper-connected world, constant notifications and information overload create digital overwhelm. Regular mindfulness practice reduces stress, improves focus, and enhances emotional regulation. Simple breathing exercises for just five minutes daily can make a meaningful difference. Create tech-free zones and schedule digital detox days to establish healthy boundaries. Use technology mindfully by setting intentions and taking regular breaks between tasks.`,
    date: "2024-01-25",
    author: "Mike Johnson"
  },
  4: {
    title: "The Art of Productive Remote Work",
    content: `Remote work requires intention, discipline, and the right strategies to succeed. Set up a dedicated workspace with ergonomic furniture and reliable internet to boost productivity. Use time management techniques like the Pomodoro method to maintain focus throughout the day. Clear communication becomes even more important when working remotely—over-communicate rather than under-communicate. Establish clear boundaries between work and personal life to prevent burnout. Stay connected with your team through virtual check-ins and collaborative tools to combat isolation.`,
    date: "2024-02-01",
    author: "Sarah Wilson"
  }
};

function BlogPost() {
  const { id } = useParams();
  const postRef = useRef(null);
  
  const post = fullPosts[id];

  useEffect(() => {
    if (postRef.current) {
      postRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (!post) {
    return (
      <div className="blog-post">
        <h1>Post Not Found</h1>
        <p>The post you're looking for doesn't exist.</p>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="blog-post" ref={postRef}>
      <article className="post-content">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>By {post.author}</span>
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
        <div className="post-body">
          {post.content.split('\n').map((paragraph, index) => {
            if (paragraph.startsWith('##')) {
              return <h2 key={index}>{paragraph.replace('##', '').trim()}</h2>;
            } else if (paragraph.startsWith('#')) {
              return <h3 key={index}>{paragraph.replace('#', '').trim()}</h3>;
            } else if (paragraph.startsWith('```')) {
              return null;
            } else if (paragraph.includes('`') && paragraph.includes('jsx')) {
              return null;
            } else if (paragraph.includes('`') && paragraph.includes('bash')) {
              return null;
            } else if (paragraph.includes('`') && paragraph.includes('css')) {
              return null;
            } else if (paragraph.trim() === '') {
              return <br key={index} />;
            } else {
              return <p key={index}>{paragraph}</p>;
            }
          })}
        </div>
        <Link to="/" className="back-link">← Back to Home</Link>
      </article>
    </div>
  );
}

export default BlogPost;
