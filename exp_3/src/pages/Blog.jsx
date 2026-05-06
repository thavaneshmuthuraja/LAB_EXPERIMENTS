import posts from "../data/post";
import PostItem from "../components/postitem";

function Blog() {
  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}

export default Blog;