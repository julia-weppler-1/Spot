import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

/*
  HomePage is the one public page in the app. Logged out it explains what Spot
  is and points at Register/Login; logged in it becomes a hub, with each of the
  four cards linking into its section. The cards are only links when there is a
  user, since every destination is behind ProtectedRoute and would otherwise
  bounce the visitor straight back to the login form.
*/

// the four areas of the app, described once and rendered in both states
const SECTIONS = [
  {
    title: "Pacts",
    to: "/pacts",
    description:
      "Set a weekly training target with a partner and build a shared streak.",
  },
  {
    title: "Log Workout",
    to: "/log",
    description:
      "Record sets, reps and weight. New personal records are flagged as you go.",
  },
  {
    title: "Workout History",
    to: "/history",
    description:
      "Browse past sessions, filter by exercise or date, and see your records.",
  },
  {
    title: "Challenges",
    to: "/challenges",
    description:
      "Post a time-boxed goal, accept someone else's, and log daily proof.",
  },
];

function HomePage({ currentUser, loading }) {
  return (
    <div className={styles.homePage}>
      {currentUser ? (
        <>
          <h1>Welcome back, {currentUser.displayName}</h1>
          <p className={styles.homeIntro}>Pick up where you left off.</p>
        </>
      ) : (
        <>
          <h1>Spot</h1>
          <p className={styles.homeIntro}>
            Track your workouts and keep a gym pact with a partner.
          </p>
          {/* the buttons wait for the session check, so someone already signed
              in isn't shown sign-in prompts for a moment first */}
          {!loading && (
            <div className={styles.homeActions}>
              <Link to="/register" className="btnApprove">
                Get started
              </Link>
              <Link to="/login" className="btnNeutral">
                Log in
              </Link>
            </div>
          )}
        </>
      )}

      <div className={styles.homeGrid}>
        {SECTIONS.map((section) => (
          <article key={section.to} className={styles.homeCard}>
            <h2 className={styles.homeCardTitle}>
              {/* only a link once signed in — the destinations are protected */}
              {currentUser ? (
                <Link to={section.to}>{section.title}</Link>
              ) : (
                section.title
              )}
            </h2>
            <p className={styles.homeCardText}>{section.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// currentUser is null when nobody is logged in, so it isn't required
HomePage.propTypes = {
  currentUser: PropTypes.shape({
    displayName: PropTypes.string,
  }),
  loading: PropTypes.bool.isRequired,
};

export default HomePage;
