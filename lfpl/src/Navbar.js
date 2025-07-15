import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }
  return (
    <nav className="nav">
      <a href="/" className="home">
        Home
      </a>
      <a href="/team" className="team">
        Team
      </a>
      <a href="/transfers" className="transfers">
        Transfers
      </a>
    </nav>
  );
}
