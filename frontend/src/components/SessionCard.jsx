import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "./SessionCard.module.css";

// one blank exercise row — the shape "Add exercise" appends
const blankExercise = { name: "", sets: "", reps: "", weight: "" };

function SessionCard({ session, onChanged }) {
  const [editing, setEditing] = useState(false);
  // the Edit button and the first field of the form it opens: pressing Edit
  // removes that button from the page, so we move focus deliberately instead
  // of letting it fall to the top of the document
  const editButtonRef = useRef(null);
  const firstFieldRef = useRef(null);
  // "Add exercise" stays put when a row is removed, so it's a safe landing spot
  const addRowButtonRef = useRef(null);
  // tracks whether the last change was driven by the keyboard/mouse, so we
  // don't steal focus on the card's very first render
  const hasToggled = useRef(false);
  const [notes, setNotes] = useState(session.notes);
  // exercises are edited in their own state, seeded from the saved session
  const [exercises, setExercises] = useState(session.exercises);
  const [error, setError] = useState("");

  // move focus whenever we switch between reading and editing, so the keyboard
  // follows the button that just disappeared
  useEffect(() => {
    // skip the first render — nothing was clicked yet
    if (!hasToggled.current) return;
    if (editing && firstFieldRef.current) {
      // the edit form just opened, so start the user in its first field
      firstFieldRef.current.focus();
    } else if (!editing && editButtonRef.current) {
      // back to reading, so return to the Edit button that reappeared
      editButtonRef.current.focus();
    }
  }, [editing]);

  // pull the server's message off a failed response so the user sees why
  async function readError(res, fallback) {
    const data = await res.json().catch(() => ({}));
    return data.error || fallback;
  }

  // update one field of one exercise row
  function updateExercise(index, field, value) {
    setExercises(
      exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  }

  function addRow() {
    setExercises([...exercises, { ...blankExercise }]);
  }

  function removeRow(index) {
    setExercises(exercises.filter((_, i) => i !== index));
    // this button is about to disappear with its row, so hand the keyboard to
    // "Add exercise", which is the nearest control that stays put
    if (addRowButtonRef.current) {
      addRowButtonRef.current.focus();
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this session?");
    if (!confirmed) return;
    setError("");
    const res = await fetch(`/api/sessions/${session._id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await readError(res, "Could not delete session"));
      return;
    }
    onChanged(); // tell the page to re-fetch
  }

  async function handleSaveEdit() {
    setError("");
    // convert the string inputs to numbers before sending, like the log form
    const cleaned = exercises.map((ex) => ({
      name: ex.name,
      sets: Number(ex.sets),
      reps: Number(ex.reps),
      weight: Number(ex.weight),
    }));
    // date stays the same — only exercises and notes are editable here
    const res = await fetch(`/api/sessions/${session._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: session.date,
        exercises: cleaned,
        notes,
      }),
    });
    if (!res.ok) {
      setError(await readError(res, "Could not save changes"));
      return;
    }
    // no focus move here: onChanged re-fetches the list and may replace this
    // card entirely, so the Edit button we'd aim at might not survive
    setEditing(false);
    onChanged();
  }

  // drop any typing that wasn't saved
  function handleCancel() {
    setNotes(session.notes);
    setExercises(session.exercises);
    setError("");
    hasToggled.current = true;
    setEditing(false);
  }

  return (
    <article className={styles.sessionCard}>
      <div className={styles.sessionCardHeader}>
        <strong>{session.date}</strong>
        <div className={styles.sessionCardActions}>
          {editing ? (
            <>
              <button
                type="button"
                className="btnApprove"
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button
                type="button"
                className="btnNeutral"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btnNeutral"
                ref={editButtonRef}
                onClick={() => {
                  hasToggled.current = true;
                  setEditing(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btnDanger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <fieldset className={styles.exerciseFieldset}>
          <legend>Exercises</legend>
          {exercises.map((ex, index) => (
            <div className={styles.exerciseRow} key={index}>
              {/* only the first row's name field is the focus target */}
              <input
                type="text"
                placeholder="Exercise"
                ref={index === 0 ? firstFieldRef : null}
                value={ex.name}
                onChange={(e) => updateExercise(index, "name", e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Sets"
                value={ex.sets}
                onChange={(e) => updateExercise(index, "sets", e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Reps"
                value={ex.reps}
                onChange={(e) => updateExercise(index, "reps", e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Weight"
                value={ex.weight}
                onChange={(e) =>
                  updateExercise(index, "weight", e.target.value)
                }
                required
              />
              {exercises.length > 1 && (
                <button
                  type="button"
                  className="btnNeutral"
                  onClick={() => removeRow(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btnNeutral"
            ref={addRowButtonRef}
            onClick={addRow}
          >
            Add exercise
          </button>
        </fieldset>
      ) : (
        <ul className={styles.sessionCardExercises}>
          {session.exercises.map((ex, i) => (
            <li key={i} className={ex.isPR ? styles.prHit : ""}>
              {ex.name}: {ex.sets}×{ex.reps} @ {ex.weight} lbs
              {ex.isPR && <span className={styles.prBadge}>PR</span>}
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <textarea
          className={styles.sessionCardNotesEdit}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      ) : (
        session.notes && (
          <p className={styles.sessionCardNotes}>{session.notes}</p>
        )
      )}

      {/* always rendered so a screen reader announces the message when it appears */}
      <p className={styles.sessionCardError} role="alert" aria-live="polite">
        {error}
      </p>
    </article>
  );
}

SessionCard.propTypes = {
  session: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    exercises: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        sets: PropTypes.number,
        reps: PropTypes.number,
        weight: PropTypes.number,
        isPR: PropTypes.bool,
      }),
    ).isRequired,
    notes: PropTypes.string,
  }).isRequired,
  onChanged: PropTypes.func.isRequired,
};

export default SessionCard;
