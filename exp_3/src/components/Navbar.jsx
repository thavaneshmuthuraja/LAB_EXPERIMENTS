import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav>
      <h2>My Blog</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;