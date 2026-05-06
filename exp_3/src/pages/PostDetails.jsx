import { useParams } from "react-router-dom";
import posts from "../data/post";

function PostDetails() {
  const { id } = useParams();
  const post = posts.find(p => p.id === parseInt(id));

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}

export default PostDetails;