import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  AuthContext,
} from "../../context/AuthContext";

import{ api } from "../../services/api";
import "./ProfessionalProfile.css";

function ProfessionalProfile() {
  const { token } =
    useContext(AuthContext);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    headline: "",
    bio: "",
    phone: "",
    website: "",
    linkedinUrl: "",
    githubUrl: "",
    dateOfBirth: "",
    profilePhotoUrl: "",
  });

  const [cvFile, setCvFile] =
  useState(null);

const [cvUploading, setCvUploading] =
  useState(false);

const handleCvUpload = async () => {
  if (!cvFile) {
    alert("Select a CV first.");
    return;
  }

  try {
    setCvUploading(true);

    await api.uploadCv(
      token,
      cvFile
    );

    setCvFile(null);

    await loadProfile();

    alert(
      "CV uploaded successfully."
    );
  } catch (error) {
    alert(error.message);
  } finally {
    setCvUploading(false);
  }
};

const [
  completion,
  setCompletion,
] = useState(null);

const loadProfile = async () => {
  try {
    const completionResponse =
      await api.getProfileCompletion(token);

    setCompletion(completionResponse.data);

    const response =
      await api.getMyProfessionalProfile(token);

    const data = response.data;

    setProfile(data);

    if (data.profile) {
      setForm({
        headline: data.profile.headline || "",
        bio: data.profile.bio || "",
        phone: data.profile.phone || "",
        website: data.profile.website || "",
        linkedinUrl: data.profile.linkedin_url || "",
        githubUrl: data.profile.github_url || "",
        dateOfBirth: data.profile.date_of_birth || "",
        profilePhotoUrl: data.profile.profile_photo_url || "",
      });
    }
  } catch (error) {
    console.error("Failed to load professional profile:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (token) {
      loadProfile();
    } else{
      setLoading(false);
    }
  }, [token]);

  const handleChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveProfile = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);

      await api.updateProfessionalProfile(
        token,
        form
      );

      alert(
        "Profile updated successfully."
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

if (loading) {
  return (
    <div className="page-loading">
      Loading profile...
    </div>
  );
}

if (!token) {
  return (
    <div className="page-loading">
      <h2>Please log in to view your professional profile.</h2>
      <a href="/login">Go to Login</a>
    </div>
  );
}

  return (
    <div className="professional-profile-page">
      <div className="professional-profile-container">

        <header>
          <h1>
            Professional Profile
          </h1>

          <p>
            Build one professional identity
            for your FELG journey.
          </p>
        </header>

        <form
          className="profile-form"
          onSubmit={saveProfile}
        >
          <label>
            Professional headline

            <input
              name="headline"
              value={form.headline}
              onChange={
                handleChange
              }
              placeholder="Frontend Developer | Computer Science Student"
            />
          </label>

          <label>
            Bio

            <textarea
              name="bio"
              value={form.bio}
              onChange={
                handleChange
              }
              rows="6"
              placeholder="Tell employers and organizations about yourself..."
            />
          </label>

          <label>
            Phone

            <input
              name="phone"
              value={form.phone}
              onChange={
                handleChange
              }
            />
          </label>

          <label>
            Website

            <input
              name="website"
              value={form.website}
              onChange={
                handleChange
              }
              placeholder="https://..."
            />
          </label>

          <label>
            LinkedIn

            <input
              name="linkedinUrl"
              value={
                form.linkedinUrl
              }
              onChange={
                handleChange
              }
              placeholder="https://linkedin.com/..."
            />
          </label>

          <label>
            GitHub

            <input
              name="githubUrl"
              value={
                form.githubUrl
              }
              onChange={
                handleChange
              }
              placeholder="https://github.com/..."
            />
          </label>

          <label>
            Profile photo URL

            <input
              name="profilePhotoUrl"
              value={
                form.profilePhotoUrl
              }
              onChange={
                handleChange
              }
              placeholder="https://..."
            />
          </label>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </form>

        <section className="profile-summary">
          <h2>
            Profile overview
          </h2>

          <p>
            Skills:{" "}
            {profile?.skills?.length ||
              0}
          </p>

          <p>
            Education:{" "}
            {profile?.education?.length ||
              0}
          </p>

          <p>
            Experience:{" "}
            {profile?.experience?.length ||
              0}
          </p>

          <p>
            Projects:{" "}
            {profile?.projects?.length ||
              0}
          </p>

          <p>
            CV:{" "}
            {profile?.cv
              ? "Uploaded"
              : "Not added"}
          </p>
        </section>

        <section className="cv-section">

  <h2>
    Your CV
  </h2>

  {profile?.cv ? (
    <div className="cv-current">

      <p>
        Current CV:
        {" "}
        {profile.cv.file_name}
      </p>

      <a
        href={
          `http://localhost:5000${profile.cv.file_url}`
        }
        target="_blank"
        rel="noreferrer"
      >
        View CV
      </a>

      <button
        type="button"
        onClick={async () => {
          try {
            await api.deleteCv(
              token
            );

            await loadProfile();

          } catch (error) {
            alert(
              error.message
            );
          }
        }}
      >
        Delete CV
      </button>

    </div>
  ) : (
    <p>
      You haven't uploaded a CV yet.
    </p>
  )}

  <div className="cv-upload">

    <input
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={(event) =>
        setCvFile(
          event.target.files?.[0] ||
            null
        )
      }
    />

    <button
      type="button"
      onClick={handleCvUpload}
      disabled={cvUploading}
    >
      {cvUploading
        ? "Uploading..."
        : "Upload CV"}
    </button>

  </div>

  <small>
    PDF, DOC and DOCX. Maximum 5 MB.
  </small>

</section>

<section className="completion-card">

  <div className="completion-header">
    <div>
      <h2>
        Profile Completion
      </h2>

      <p>
        Complete your profile to
        improve your FELG experience.
      </p>
    </div>

    <strong>
      {completion?.score || 0}%
    </strong>
  </div>

  <div className="completion-bar">
    <div
      className="completion-progress"
      style={{
        width:
          `${completion?.score || 0}%`,
      }}
    />
  </div>

  <div className="completion-checks">
    {completion?.checks?.map(
      (item) => (
        <div
          key={item.key}
          className={
            item.complete
              ? "completion-item complete"
              : "completion-item"
          }
        >
          <span>
            {item.complete
              ? "✓"
              : "○"}
          </span>

          {item.label}
        </div>
      )
    )}
  </div>

</section>

      </div>
    </div>
  );
}

export default ProfessionalProfile;