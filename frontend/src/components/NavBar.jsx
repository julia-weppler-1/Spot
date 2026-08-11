import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";

// NavLink hands us isActive, so we pick the highlighted class for the current page
function navLinkClass({ isActive }) {
  return isActive ? styles.navLinkActive : styles.navLink;
}

function NavBar({ currentUser, loading, onLogout }) {
  const navigate = useNavigate();

  async function handleLogoutClick() {
    // run the parent's logout logic (clears currentUser in App)
    await onLogout();
    // send the user back to the login page
    navigate("/login");
  }

  // while we're still checking for a logged-in session, show nothing yet
  if (loading) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navbarBrand}>
        Spot
      </Link>

      <div className={styles.navbarLinks}>
        {currentUser ? (
          <>
            {/* greet with the friendly name, plus the login handle */}
            <span className={styles.navbarUser}>
              Hi, {currentUser.displayName} (@{currentUser.username})
            </span>
            <span className={styles.navbarSeparator}>|</span>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
            {/* "end" stops Pacts matching every route, since all paths start with / */}
            <NavLink to="/" end className={navLinkClass}>
              Pacts
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Make a Pact
            </NavLink>
            <NavLink to="/log" className={navLinkClass}>
              Log Workout
            </NavLink>
            <NavLink to="/history" className={navLinkClass}>
              Workout History
            </NavLink>
            <NavLink to="/challenges" className={navLinkClass}>
              Challenges
            </NavLink>
            <button
              type="button"
              className="btnNeutral"
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClass}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

// currentUser is null when nobody is logged in, so it isn't required
NavBar.propTypes = {
  currentUser: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
  }),
  loading: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default NavBar;
