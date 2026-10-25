const pool = require("../config/database");

const savedSearch = result.rows[0];

if (alertsEnabled) {
  await pool.query(
    `
    INSERT INTO search_alerts
    (
      user_id,
      saved_search_id,
      is_active
    )
    VALUES ($1, $2, TRUE)
    `,
    [
      req.user.id,
      savedSearch.id,
    ]
  );
}

res.status(201).json({
  success: true,
  data: savedSearch,
});

const updateSearchAlert = async (req, res) => {
  try {
    const {
      enabled,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE saved_searches
      SET alerts_enabled = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND user_id = $3
      RETURNING *
      `,
      [
        Boolean(enabled),
        req.params.id,
        req.user.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Saved search not found",
      });
    }

    await pool.query(
      `
      UPDATE search_alerts
      SET is_active = $1
      WHERE saved_search_id = $2
        AND user_id = $3
      `,
      [
        Boolean(enabled),
        req.params.id,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update search alert error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update search alert",
    });
  }
};

const createSavedSearch = async (req, res) => {
  try {
    const {
      name,
      query = "",
      searchType = "jobs",
      country = "",
      workType = "",
      degreeLevel = "",
      sortBy = "relevance",
      alertsEnabled = false,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO saved_searches
      (
        user_id,
        name,
        query,
        search_type,
        country,
        work_type,
        degree_level,
        sort_by,
        alerts_enabled
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        req.user.id,
        name.trim(),
        query,
        searchType,
        country,
        workType,
        degreeLevel,
        sortBy,
        alertsEnabled,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create saved search error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to save search",
    });
  }
};

const getSavedSearches = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM saved_searches
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get saved searches error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load saved searches",
    });
  }
};

const deleteSavedSearch = async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM saved_searches
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Saved search not found",
      });
    }

    res.json({
      success: true,
      message: "Saved search deleted",
    });
  } catch (error) {
    console.error(
      "Delete saved search error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete saved search",
    });
  }
};

module.exports = {
  createSavedSearch,
  getSavedSearches,
  deleteSavedSearch,
  updateSearchAlert,
};