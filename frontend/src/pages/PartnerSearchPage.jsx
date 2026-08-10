import { useState } from "react";
import UserCard from "../components/UserCard";
import PactForm from "../components/PactForm";
import styles from "./PartnerSearchPage.module.css";

function PartnerSearchPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);

  async function handleSearch(e) {
    // stop the browser from doing a full page reload on submit
    e.preventDefault();

    // ask the server for users whose username/displayName match the search term
    const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
    if (res.ok) {
      const data = await res.json();
      setResults(data);
    }
  }

  return (
    <div className={styles.partnerSearchPage}>
      <div className={styles.searchHeader}>
        <h1>Make a Pact</h1>

        <form onSubmit={handleSearch}>
          <label htmlFor="search">Search by username or display name</label>
          <input
            id="search"
            name="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btnNeutral">
            Search
          </button>
        </form>
      </div>

      <div className={styles.searchColumns}>
        <div className={styles.searchColumn}>
          {results.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onPropose={setSelectedPartner}
            />
          ))}
        </div>

        <div className={styles.searchColumn}>
          {selectedPartner && (
            <PactForm
              partner={selectedPartner}
              onCancel={() => setSelectedPartner(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PartnerSearchPage;
