import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Notifications() {
  const { token } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadNotifications = async () => {
    try {
      const data =
        await api.getNotifications(token);

      setNotifications(
        data.notifications
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(
        token,
        id
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead(
        token
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="education-page">

      <nav className="dashboard-nav">

        <Link
          to="/"
          className="logo"
        >
          FELG
        </Link>

        <Link to="/dashboard">
          Dashboard
        </Link>

      </nav>

      <main className="education-container">

        <div className="notifications-heading">

          <div>
            <p className="small-label">
              FELG
            </p>

            <h1>
              Notifications
            </h1>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={markAllRead}
              className="secondary-button"
            >
              Mark all as read
            </button>
          )}

        </div>

        {loading ? (
          <p>
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (

          <div className="empty-jobs">

            <h2>
              You're all caught up.
            </h2>

            <p>
              New updates will appear here.
            </p>

          </div>

        ) : (

          <div className="notifications-list">

            {notifications.map(
              (notification) => (

                <button
                  key={notification.id}
                  className={
                    `notification-card ${
                      notification.is_read
                        ? "read"
                        : "unread"
                    }`
                  }
                  onClick={() =>
                    markRead(
                      notification.id
                    )
                  }
                >

                  <div className="notification-icon">
                    {notification.type ===
                    "connection"
                      ? "🤝"
                      : notification.type ===
                        "job_application"
                      ? "💼"
                      : "🎓"}
                  </div>

                  <div>

                    <h3>
                      {notification.title}
                    </h3>

                    <p>
                      {notification.message}
                    </p>

                    <small>
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </small>

                  </div>

                  {!notification.is_read && (
                    <span className="unread-dot" />
                  )}

                </button>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default Notifications;