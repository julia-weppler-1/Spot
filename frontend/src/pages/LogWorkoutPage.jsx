import { useState } from "react";
import { Link } from "react-router-dom";
import SessionForm from "../components/SessionForm";
import styles from "./LogWorkoutPage.module.css";

function LogWorkoutPage() {
  // holds the session that was just logged, so we can show PR results
  const [lastLogged, setLastLogged] = useState(null);

  return (
    <div className={styles.logWorkoutPage}>
      <h1>Log a Workout</h1>

      <SessionForm onLogged={setLastLogged} />

      {/* always rendered so a screen reader announces the confirmation when it appears */}
      <p className={styles.logConfirm} role="status" aria-live="polite">
        {lastLogged ? "Workout logged." : ""}
      </p>

      {lastLogged && (
        <section className={styles.logResult}>
          <h2>Logged — {lastLogged.date}</h2>
          <ul>
            {lastLogged.exercises.map((ex, i) => (
              <li key={i} className={ex.isPR ? styles.prHit : ""}>
                {ex.name}: {ex.sets}×{ex.reps} @ {ex.weight} lbs
                {ex.isPR && <span className={styles.prBadge}>New PR</span>}
              </li>
            ))}
          </ul>

          {/* the logged session is only visible on the history page, so offer the trip */}
          <p className={styles.logResultLink}>
            <Link to="/history">View workout history</Link>
          </p>
        </section>
      )}
    </div>
  );
}

export default LogWorkoutPage;
