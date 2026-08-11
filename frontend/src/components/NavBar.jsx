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
    // back to the homepage rather than the login form — signing out isn't a
    // request to sign in again
    navigate("/");
  }

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navbarBrand}>
        Spot
      </Link>

      {/* the brand always renders. the links wait for the session check, since
          showing Login and Register to someone already signed in — then
          swapping them out — reads as the page changing its mind */}
      <div className={styles.navbarLinks}>
        {loading ? null : currentUser ? (
          <>
            {/* greet with the friendly name, plus the login handle */}
            <span className={styles.navbarUser}>
              Hi, {currentUser.displayName} (@{currentUser.username})
            </span>
            <span className={styles.navbarSeparator}>|</span>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
            {/* "end" stops Home matching every route, since all paths start with / */}
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/pacts" className={navLinkClass}>
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
            {/* signed-out visitors need the way back to the homepage too, since
                the login and register pages are otherwise a one-way trip */}
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
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
