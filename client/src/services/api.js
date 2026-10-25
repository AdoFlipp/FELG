const API_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
professionalJobSearch: (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      searchParams.set(key, value);
    }
  });

  return request(
    `/search/jobs?${searchParams.toString()}`
  );
},
  // Authentication
  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // User profile
  getProfile: (token) =>
    request("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateProfile: (token, profileData) =>
    request("/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(profileData),
    }),

  // Jobs
  getJobs: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/jobs?${query.toString()}`);
  },

  getJob: (id) => request(`/jobs/${id}`),

  applyForJob: (token, jobId) =>
    request(`/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),

  getMyApplications: (token) =>
    request("/jobs/applications/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Organizations
  createOrganization: (token, data) =>
    request("/organizations", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  getMyOrganization: (token) =>
    request("/organizations/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Employer jobs and applicants
  createJob: (token, data) =>
    request("/jobs", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  getMyJobs: (token) =>
    request("/employer/jobs", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getApplicants: (token, jobId) =>
    request(`/employer/jobs/${jobId}/applicants`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateApplicationStatus: (token, applicationId, status) =>
    request(`/employer/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }),

  // Education programs
  getPrograms: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/education/programs?${query.toString()}`);
  },

  getProgram: (id) =>
    request(`/education/programs/${id}`),

  applyToProgram: (token, programId) =>
    request(`/education/programs/${programId}/apply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),

  getMyEducationApplications: (token) =>
    request("/education/applications/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

getScholarships: (params = {}) => {
  const query = new URLSearchParams(params);

  return request(
    `/scholarships?${query.toString()}`
  );


getAtsStatistics: (token) =>
  request("/ats/statistics", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
},


createEducationProgram: (
  token,
  data
) =>
  request(
    "/education/admin/programs",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  ),

createScholarship: (token, data) =>
  request("/education/admin/scholarships", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }),

getInstitutionApplications: (token) =>
  request("/education/admin/applications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

updateEducationApplicationStatus: (
  token,
  applicationId,
  status
) =>
  request(
    `/education/admin/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  ),

getPosts: (token) =>
  request("/network/posts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

createPost: (token, content) =>
  request("/network/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
    }),
  }),

getComments: (token, postId) =>
  request(`/network/posts/${postId}/comments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

createComment: (token, postId, content) =>
  request(`/network/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
    }),
  }),

sendConnection: (token, userId) =>
  request(`/network/connections/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

acceptConnection: (token, connectionId) =>
  request(`/network/connections/${connectionId}/accept`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

getMyConnections: (token) =>
  request("/network/connections", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

getNotifications: (token) =>
  request("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

markNotificationRead: (token, notificationId) =>
  request(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

markAllNotificationsRead: (token) =>
  request("/notifications/read-all", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

getMentors: (token, search = "") =>
  request(
    `/mentors?search=${encodeURIComponent(search)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ),

getStartups: (params = {}) => {
  const query = new URLSearchParams(params);

  return request(
    `/startups?${query.toString()}`
  );
},

getStartup: (id) =>
  request(
    `/startups/${id}`
  ),

createStartup: (
  token,
  data
) =>
  request("/startups", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }),

addStartupMember: (
  token,
  startupId,
  data
) =>
  request(
    `/startups/${startupId}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  ),

getStartupOpportunities: (
  params = {}
) => {
  const query =
    new URLSearchParams(params);

  return request(
    `/startups/opportunities?${query.toString()}`
  );
},

createStartupOpportunity: (
  token,
  startupId,
  data
) =>
  request(
    `/startups/${startupId}/opportunities`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  ),

getRecommendations: (token) =>
  request(
    "/matching/recommendations",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ),

getAdminStatistics: (token) =>
  request("/admin/statistics", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

getAdminUsers: (
  token,
  params = {}
) => {
  const query =
    new URLSearchParams(params);

  return request(
    `/admin/users?${query.toString()}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
},

updateAdminUserStatus: (
  token,
  userId,
  isActive
) =>
  request(
    `/admin/users/${userId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify({
        isActive,
      }),
    }
  ),

verifyAdminUser: (
  token,
  userId
) =>
  request(
    `/admin/users/${userId}/verify`,
    {
      method: "PATCH",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

getAdminOrganizations: (
  token
) =>
  request(
    "/admin/organizations",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

verifyAdminOrganization: (
  token,
  organizationId
) =>
  request(
    `/admin/organizations/${organizationId}/verify`,
    {
      method: "PATCH",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

getAdminActions: (
  token
) =>
  request(
    "/admin/actions",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

globalSearch: (
  query,
  type = "all",
  country = ""
) => {
  const params =
    new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (type) {
    params.set("type", type);
  }

  if (country) {
    params.set(
      "country",
      country
    );
  }

  return request(
    `/search?${params.toString()}`
  );
},

createSavedSearch: (token, search) =>
  request("/saved-searches", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(search),
  }),

getSavedSearches: (token) =>
  request("/saved-searches", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

deleteSavedSearch: (token, id) =>
  request(`/saved-searches/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

updateSearchAlert: (
  token,
  id,
  enabled
) =>
  request(`/saved-searches/${id}/alert`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      enabled,
    }),
  }),

getJobMatch: (
  token,
  jobId
) =>
  request(
    `/matching/jobs/${jobId}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

getRecommendedJobs: (
  token,
  limit = 10
) =>
  request(
    `/matching/jobs/recommended?limit=${limit}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

getStartups: (params = {}) => {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        searchParams.set(
          key,
          value
        );
      }
    }
  );

  return request(
    `/startups?${searchParams.toString()}`
  );
},

getStartup: (id) =>
  request(`/startups/${id}`),

createStartup: (
  token,
  startup
) =>
  request("/startups", {
    method: "POST",
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
    body: JSON.stringify(
      startup
    ),
  }),

createStartupOpportunity: (
  token,
  startupId,
  opportunity
) =>
  request(
    `/startups/${startupId}/opportunities`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify(
        opportunity
      ),
    }
  ),

applyToStartupOpportunity: (
  token,
  opportunityId,
  message = ""
) =>
  request(
    `/startups/opportunities/${opportunityId}/apply`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
      }),
    }
  ),

requestStartupInterest: (
  token,
  startupId,
  message = ""
) =>
  request(
    `/startups/${startupId}/interest`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
      }),
    }
  ),

getMyStartups: (token) =>
  request("/startup-management/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

updateStartup: (
  token,
  startupId,
  startup
) =>
  request(
    `/startup-management/${startupId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(startup),
    }
  ),

getMyStartupOpportunities: (
  token,
  startupId
) =>
  request(
    `/startup-management/${startupId}/opportunities`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ),

updateStartupOpportunity: (
  token,
  opportunityId,
  opportunity
) =>
  request(
    `/startup-management/opportunities/${opportunityId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(opportunity),
    }
  ),

getStartupApplicants: (
  token,
  startupId
) =>
  request(
    `/startup-management/${startupId}/applicants`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ),

updateStartupApplicationStatus: (
  token,
  startupId,
  applicationId,
  status
) =>
  request(
    `/startup-management/${startupId}/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  ),

getMyProfessionalProfile: (
  token
) =>
  request(
    "/professional-profile/me",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

updateProfessionalProfile: (
  token,
  profile
) =>
  request(
    "/professional-profile/me",
    {
      method: "PUT",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    }
  ),

addPortfolioProject: (
  token,
  project
) =>
  request(
    "/professional-profile/projects",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify(project),
    }
  ),

deletePortfolioProject: (
  token,
  projectId
) =>
  request(
    `/professional-profile/projects/${projectId}`,
    {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

addExperience: (
  token,
  experience
) =>
  request(
    "/professional-profile/experience",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify(
        experience
      ),
    }
  ),

deleteExperience: (
  token,
  experienceId
) =>
  request(
    `/professional-profile/experience/${experienceId}`,
    {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

uploadCv: (
  token,
  file
) => {
  const formData =
    new FormData();

  formData.append(
    "cv",
    file
  );

  return fetch(
    "http://localhost:5000/api/professional-profile/cv",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body: formData,
    }
  ).then(async (response) => {
    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "CV upload failed"
      );
    }

    return data;
  });
},

deleteCv: (
  token
) =>
  request(
    "/professional-profile/cv",
    {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

getProfileCompletion: (
  token
) =>
  request(
    "/professional-profile/completion",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

getEmployerApplications: (
  token,
  params = {}
) => {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        searchParams.set(
          key,
          value
        );
      }
    }
  );

  return request(
    `/ats/applications?${searchParams.toString()}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
},

getApplicantDetails: (
  token,
  applicationId
) =>
  request(
    `/ats/applications/${applicationId}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  ),

updateAtsApplicationStatus: (
  token,
  applicationId,
  status
) =>
  request(
    `/ats/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  )
};