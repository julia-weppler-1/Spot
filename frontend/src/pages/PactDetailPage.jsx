import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./PactDetailPage.module.css";

// maps a pact's status to the matching pill style, since CSS Module class
// names are camelCase and can't be built by string interpolation
const statusStyles = {
  pending: styles.statusPending,
  active: styles.statusActive,
};

function PactDetailPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pact, setPact] = useState(null);
  const [weeklyTarget, setWeeklyTarget] = useState(1);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  // fetches this pact (with both partners' profiles) from the server.
  // useCallback keeps the same function between renders unless the id
  // changes, so the useEffect below can safely depend on it.
  const loadPact = useCallback(async () => {
    const res = await fetch(`/api/pacts/${id}`);
    if (res.ok) {
      const data = await res.json();
      setPact(data);
      setWeeklyTarget(data.weeklyTarget);
      return;
    }
    // without this the page would sit on "Loading pact..." forever
    const data = await res.json();
    setLoadError(data.error || "Could not load this pact");
  }, [id]);

  // load the pact when the page mounts, and again if the id in the url changes
  useEffect(() => {
    loadPact();
  }, [loadPact]);

  async function handleSaveTarget(e) {
    // stop the browser from doing a full page reload on submit
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/pacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyTarget: Number(weeklyTarget) }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }

    // head back to the dashboard now that the new target is saved
    navigate("/");
  }

  // the pact couldn't be loaded at all — say so instead of hanging
  if (loadError) {
    return (
      <div className={styles.pactDetailPage}>
        <p className={styles.pactDetailError}>{loadError}</p>
        <Link to="/">Back to dashboard</Link>
      </div>
    );
  }

  // still waiting on the initial fetch
  if (!pact) {
    return <p>Loading pact...</p>;
  }

  // work out which side of the pact is me, so the "this week" tile can label
  // my own count as "You" and show the other person by name
  const iAmPartnerA = pact.partnerA._id === currentUser._id;
  const partner = iAmPartnerA ? pact.partnerB : pact.partnerA;
  const canEdit = pact.status === "pending" && pact.role === "proposer";

  return (
    <div className={styles.pactDetailPage}>
      <Link to="/">← Back to dashboard</Link>

      <div className={styles.pactDetailCard}>
        {/* names lead, with the status pill on the right */}
        <div className={styles.pactDetailHeader}>
          <h1>
            You &amp; {partner.displayName} (@{partner.username})
          </h1>
          <span className={`${styles.pactStatus} ${statusStyles[pact.status]}`}>
            {pact.status}
          </span>
        </div>

        <div className={styles.statTiles}>
          {/* weekly target is the anchor — first and, when pending, editable */}
          <div className={`${styles.statTile} ${styles.statTileTarget}`}>
            {canEdit ? (
              <form onSubmit={handleSaveTarget}>
                <select
                  id="weeklyTarget"
                  name="weeklyTarget"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btnApprove">
                  Save
                </button>
              </form>
            ) : (
              <span className={styles.statNumber}>{pact.weeklyTarget}</span>
            )}
            <span className={styles.statLabel}>Weekly target</span>
          </div>

          {/* streak and this week only exist once both partners are active */}
          {pact.status === "active" && (
            <>
              <div className={`${styles.statTile} ${styles.statTileStreak}`}>
                <span className={styles.statNumber}>
                  🔥 {pact.currentStreak}
                </span>
                <span className={styles.statLabel}>Current streak (weeks)</span>
              </div>

              <div className={`${styles.statTile} ${styles.statTileWeek}`}>
                <span className={styles.statWeekLine}>
                  You{" "}
                  <b>
                    {iAmPartnerA
                      ? pact.thisWeek.partnerA
                      : pact.thisWeek.partnerB}
                  </b>{" "}
                  / {pact.thisWeek.target}
                </span>
                <span className={styles.statWeekLine}>
                  {partner.displayName}{" "}
                  <b>
                    {iAmPartnerA
                      ? pact.thisWeek.partnerB
                      : pact.thisWeek.partnerA}
                  </b>{" "}
                  / {pact.thisWeek.target}
                </span>
                <span className={styles.statLabel}>This week</span>
              </div>
            </>
          )}
        </div>

        {/* a pact you proposed is still waiting on the other person */}
        {pact.status === "pending" && pact.role === "proposer" && (
          <p className={styles.pactNote}>Waiting to be accepted</p>
        )}

        {error && <p className={styles.pactDetailError}>{error}</p>}

        {/* emails are demoted to a quiet footer — still here, just not shouting */}
        <p className={styles.pactDetailFooter}>
          {pact.partnerA.displayName} ({pact.partnerA.email}) ·{" "}
          {pact.partnerB.displayName} ({pact.partnerB.email})
        </p>
      </div>
    </div>
  );
}

PactDetailPage.propTypes = {
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
};

export default PactDetailPage;
