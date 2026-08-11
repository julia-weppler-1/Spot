import PropTypes from "prop-types";
import { memberSince } from "../lib/formatDate";
import styles from "./UserCard.module.css";

function UserCard({ user, onPropose }) {
  return (
    <article className={styles.userCard}>
      <h2>{user.displayName}</h2>
      <p className={styles.userCardUsername}>@{user.username}</p>

      {/* bio, gym and join date are all optional, so only show what's filled in */}
      {user.bio && (
        <p className={styles.userCardBio}>
          <b>Bio:</b> {user.bio}
        </p>
      )}
      {user.favoriteGym && (
        <p>
          {" "}
          <b>Favorite Gym</b> {user.favoriteGym}
        </p>
      )}
      {user.createdAt && (
        <p className={styles.userCardSince}>
          Member since {memberSince(user.createdAt)}
        </p>
      )}

      {/* pass the event too, so the page can remember this button and send
          focus back to it if the pact form is cancelled */}
      <button
        type="button"
        className="btnApprove"
        onClick={(e) => onPropose(user, e)}
      >
        Propose pact
      </button>
    </article>
  );
}

// describes the shape of the props this component expects
UserCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    bio: PropTypes.string,
    favoriteGym: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onPropose: PropTypes.func.isRequired,
};

export default UserCard;
