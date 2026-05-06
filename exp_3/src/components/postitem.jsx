import { Link } from "react-router-dom";

function PostItem({ post }) {
  return (
    <div className="post">
      <h2>{post.title}</h2>
      <Link to={`/post/${post.id}`}>Read More</Link>
    </div>
  );
}

export default PostItem;