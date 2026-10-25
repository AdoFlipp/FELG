import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";

function SavedSearches() {
  const { token } = useContext(AuthContext);

  const [searches, setSearches] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadSearches = async () => {
    try {
      const response =
        await api.getSavedSearches(token);

      setSearches(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadSearches();
    }
  }, [token]);

  const toggleAlert = async (
    search
  ) => {
    try {
      const newValue =
        !search.alerts_enabled;

      await api.updateSearchAlert(
        token,
        search.id,
        newValue
      );

      setSearches((current) =>
        current.map((item) =>
          item.id === search.id
            ? {
                ...item,
                alerts_enabled:
                  newValue,
              }
            : item
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteSearch = async (
    id
  ) => {
    try {
      await api.deleteSavedSearch(
        token,
        id
      );

      setSearches((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <p>Loading saved searches...</p>;
  }

  return (
    <div className="saved-searches-page">
      <div className="saved-searches-container">

        <h1>Saved Searches</h1>

        <p>
          Manage your saved searches and
          opportunity alerts.
        </p>

        {searches.length === 0 ? (
          <div className="search-empty">
            You haven't saved any searches yet.
          </div>
        ) : (
          <div className="saved-search-list">

            {searches.map((search) => (
              <article
                className="saved-search-card"
                key={search.id}
              >
                <h2>
                  {search.name}
                </h2>

                {search.query && (
                  <p>
                    Keyword: {search.query}
                  </p>
                )}

                {search.country && (
                  <p>
                    Country: {search.country}
                  </p>
                )}

                {search.work_type && (
                  <p>
                    Work type:{" "}
                    {search.work_type}
                  </p>
                )}

                <div className="saved-search-actions">

                  <button
                    onClick={() =>
                      toggleAlert(search)
                    }
                  >
                    {search.alerts_enabled
                      ? "🔔 Alerts On"
                      : "🔕 Alerts Off"}
                  </button>

                  <button
                    onClick={() =>
                      deleteSearch(
                        search.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>
              </article>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default SavedSearches;