import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const { token, user } = useAuth();

  const [stats, setStats] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [organizations, setOrganizations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        statisticsData,
        usersData,
        organizationsData,
      ] = await Promise.all([
        api.getAdminStatistics(token),
        api.getAdminUsers(token),
        api.getAdminOrganizations(
          token
        ),
      ]);

      setStats(
        statisticsData.statistics
      );

      setUsers(
        usersData.users
      );

      setOrganizations(
        organizationsData.organizations
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      token &&
      user?.role === "admin"
    ) {
      loadDashboard();
    }
  }, [token, user]);

  if (user?.role !== "admin") {
    return (
      <div className="admin-page">
        <h1>
          Access denied
        </h1>

        <p>
          You need administrator
          privileges to access this page.
        </p>

        <Link to="/dashboard">
          Return to dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="admin-page">

      <header className="admin-header">

        <div>
          <p className="small-label">
            FELG ADMINISTRATION
          </p>

          <h1>
            Control Center
          </h1>

          <p>
            Manage the FELG platform,
            users and organizations.
          </p>
        </div>

        <Link to="/dashboard">
          ← Main Dashboard
        </Link>

      </header>


      {/* STATISTICS */}

      <section className="admin-stats">

        <div className="admin-stat">
          <span>Users</span>
          <strong>
            {stats?.users || 0}
          </strong>
        </div>

        <div className="admin-stat">
          <span>Organizations</span>
          <strong>
            {stats?.organizations || 0}
          </strong>
        </div>

        <div className="admin-stat">
          <span>Jobs</span>
          <strong>
            {stats?.jobs || 0}
          </strong>
        </div>

        <div className="admin-stat">
          <span>Programs</span>
          <strong>
            {stats?.programs || 0}
          </strong>
        </div>

        <div className="admin-stat">
          <span>Startups</span>
          <strong>
            {stats?.startups || 0}
          </strong>
        </div>

        <div className="admin-stat">
          <span>Applications</span>
          <strong>
            {(stats?.jobApplications || 0) +
              (stats?.educationApplications || 0)}
          </strong>
        </div>

      </section>


      {/* USERS */}

      <section className="admin-panel">

        <div className="admin-panel-header">

          <div>
            <h2>
              Users
            </h2>

            <p>
              Manage FELG accounts.
            </p>
          </div>

        </div>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>
                  User
                </th>

                <th>
                  Role
                </th>

                <th>
                  Country
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {users.map(
                (account) => (

                  <tr
                    key={account.id}
                  >

                    <td>
                      <strong>
                        {account.first_name}{" "}
                        {account.last_name}
                      </strong>

                      <small>
                        {account.email}
                      </small>
                    </td>

                    <td>
                      {account.role}
                    </td>

                    <td>
                      {account.country ||
                        "—"}
                    </td>

                    <td>

                      <span
                        className={
                          account.is_active
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {account.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td>

                      <button
                        onClick={async () => {

                          await api.updateAdminUserStatus(
                            token,
                            account.id,
                            !account.is_active
                          );

                          loadDashboard();

                        }}
                      >
                        {account.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      {!account.is_verified && (
                        <button
                          onClick={async () => {

                            await api.verifyAdminUser(
                              token,
                              account.id
                            );

                            loadDashboard();

                          }}
                        >
                          Verify
                        </button>
                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ORGANIZATIONS */}

      <section className="admin-panel">

        <div className="admin-panel-header">

          <div>
            <h2>
              Organizations
            </h2>

            <p>
              Universities, colleges,
              companies and startups.
            </p>
          </div>

        </div>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>
                  Organization
                </th>

                <th>
                  Type
                </th>

                <th>
                  Location
                </th>

                <th>
                  Verification
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {organizations.map(
                (organization) => (

                  <tr
                    key={
                      organization.id
                    }
                  >

                    <td>
                      <strong>
                        {organization.name}
                      </strong>
                    </td>

                    <td>
                      {organization.type}
                    </td>

                    <td>
                      {organization.city
                        ? `${organization.city}, `
                        : ""}
                      {organization.country ||
                        "—"}
                    </td>

                    <td>
                      {organization.is_verified
                        ? "✓ Verified"
                        : "Pending"}
                    </td>

                    <td>

                      {!organization.is_verified && (
                        <button
                          onClick={async () => {

                            await api.verifyAdminOrganization(
                              token,
                              organization.id
                            );

                            loadDashboard();

                          }}
                        >
                          Verify
                        </button>
                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;