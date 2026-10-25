import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Network() {
  const { token, user } = useAuth();

  const [posts, setPosts] =
    useState([]);

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [posting, setPosting] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadPosts = async () => {
    try {
      const data =
        await api.getPosts(token);

      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadPosts();
    }
  }, [token]);

  const handlePost = async (event) => {
    event.preventDefault();

    if (!content.trim()) return;

    try {
      setPosting(true);
      setError("");

      await api.createPost(
        token,
        content
      );

      setContent("");

      await loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="network-page">

      <nav className="dashboard-nav">

        <Link
          to="/"
          className="logo"
        >
          FELG
        </Link>

        <div className="network-nav-links">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/profile">
            My Profile
          </Link>

          <Link to="/education">
            Education
          </Link>

          <Link to="/jobs">
            Jobs
          </Link>

        </div>

      </nav>

      <main className="network-container">

        <section className="network-header">

          <p className="small-label">
            FELG NETWORK
          </p>

          <h1>
            Build your professional network.
          </h1>

          <p>
            Share ideas, discover people and
            build meaningful professional
            connections.
          </p>

        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="create-post-card">

          <div className="post-user">

            <div className="post-avatar">
              {user?.first_name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <strong>
              {user?.first_name}{" "}
              {user?.last_name}
            </strong>

          </div>

          <form onSubmit={handlePost}>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Share something with your network..."
              maxLength={5000}
            />

            <button
              type="submit"
              disabled={posting}
            >
              {posting
                ? "Posting..."
                : "Create post"}
            </button>

          </form>

        </section>

        <section className="feed">

          {loading ? (
            <p>
              Loading your network...
            </p>
          ) : posts.length === 0 ? (

            <div className="empty-jobs">

              <h2>
                Your feed is empty
              </h2>

              <p>
                Be the first person to
                share something.
              </p>

            </div>

          ) : (

            posts.map((post) => (

              <article
                className="post-card"
                key={post.id}
              >

                <div className="post-header">

                  <div className="post-avatar">
                    {post.first_name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div>

                    <strong>
                      {post.first_name}{" "}
                      {post.last_name}
                    </strong>

                    <p>
                      {post.headline ||
                        post.role}
                    </p>

                  </div>

                </div>

                <p className="post-content">
                  {post.content}
                </p>

                <div className="post-footer">

                  <span>
                    💬{" "}
                    {post.comment_count}
                    {" "}comments
                  </span>

                  <span>
                    {new Date(
                      post.created_at
                    ).toLocaleDateString()}
                  </span>

                </div>

              </article>

            ))

          )}

        </section>

      </main>

    </div>
  );
}

export default Network;