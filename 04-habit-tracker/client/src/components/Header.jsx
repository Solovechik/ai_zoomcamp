import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Habit Tracker
        </Link>
        <nav className="nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/stats"
            className={`nav-link ${isActive('/stats') ? 'active' : ''}`}
          >
            Statistics
          </Link>
        </nav>
      </div>
    </header>
  );
}
