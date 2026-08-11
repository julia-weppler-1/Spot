import { useState } from "react";
import PropTypes from "prop-types";
import styles from "./ProfileForm.module.css";

function ProfileForm({ user, onSave }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [favoriteGym, setFavoriteGym] = useState(user.favoriteGym);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    // stop the browser from doing a full page reload on submit
    e.preventDefault();
    setError("");
    setSaved(false);

    const res = await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, favoriteGym, email }),
    });

    const data = await res.json();

    // show the server's error message instead of saving
    if (!res.ok) {
      setError(data.error);
      return;
    }

    // tell the parent page the profile changed, and show a saved message
    onSave(data);
    setSaved(true);
  }

  return (
    <form className={styles.profileForm} onSubmit={handleSubmit}>
      <label htmlFor="displayName">Display name</label>
      <input
        id="displayName"
        name="displayName"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="bio">Bio</label>
      <textarea
        id="bio"
        name="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <label htmlFor="favoriteGym">Favorite gym</label>
      <input
        id="favoriteGym"
        name="favoriteGym"
        type="text"
        value={favoriteGym}
        onChange={(e) => setFavoriteGym(e.target.value)}
      />

      {/* always rendered so a screen reader announces the message when it appears */}
      <p className={styles.profileFormError} role="alert" aria-live="polite">
        {error}
      </p>
      {/* always rendered so a screen reader announces the message when it appears */}
      <p className={styles.profileFormSaved} role="status" aria-live="polite">
        {saved ? "Profile saved." : ""}
      </p>

      <button type="submit" className="btnApprove">
        Save changes
      </button>
    </form>
  );
}

// describes the shape of the props this component expects
ProfileForm.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    bio: PropTypes.string,
    favoriteGym: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ProfileForm;
