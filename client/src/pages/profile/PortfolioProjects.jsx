import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  AuthContext,
} from "../../context/AuthContext";

import { api } from "../../services/api";

function PortfolioProjects() {
  const { token } =
    useContext(AuthContext);

  const [projects, setProjects] =
    useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    projectUrl: "",
    repositoryUrl: "",
    technologies: "",
    imageUrl: "",
    isFeatured: false,
  });

  const loadProjects = async () => {
    try {
      const response =
        await api.getMyProfessionalProfile(
          token
        );

      setProjects(
        response.data.projects || []
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      loadProjects();
    }
  }, [token]);

  const handleChange = (
    event
  ) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const addProject = async (
    event
  ) => {
    event.preventDefault();

    try {
      await api.addPortfolioProject(
        token,
        form
      );

      setForm({
        title: "",
        description: "",
        projectUrl: "",
        repositoryUrl: "",
        technologies: "",
        imageUrl: "",
        isFeatured: false,
      });

      await loadProjects();
    } catch (error) {
      alert(error.message);
    }
  };

  const removeProject = async (
    id
  ) => {
    try {
      await api.deletePortfolioProject(
        token,
        id
      );

      setProjects(
        (current) =>
          current.filter(
            (project) =>
              project.id !== id
          )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">

        <h1>
          Portfolio Projects
        </h1>

        <form
          className="project-form"
          onSubmit={addProject}
        >
          <input
            name="title"
            value={form.title}
            onChange={
              handleChange
            }
            placeholder="Project title"
            required
          />

          <textarea
            name="description"
            value={
              form.description
            }
            onChange={
              handleChange
            }
            placeholder="Project description"
          />

          <input
            name="projectUrl"
            value={
              form.projectUrl
            }
            onChange={
              handleChange
            }
            placeholder="Live project URL"
          />

          <input
            name="repositoryUrl"
            value={
              form.repositoryUrl
            }
            onChange={
              handleChange
            }
            placeholder="GitHub/repository URL"
          />

          <input
            name="technologies"
            value={
              form.technologies
            }
            onChange={
              handleChange
            }
            placeholder="React, Node.js, PostgreSQL"
          />

          <label>
            <input
              type="checkbox"
              name="isFeatured"
              checked={
                form.isFeatured
              }
              onChange={
                handleChange
              }
            />

            Featured project
          </label>

          <button type="submit">
            Add Project
          </button>
        </form>

        <div className="project-grid">
          {projects.map(
            (project) => (
              <article
                className="project-card"
                key={project.id}
              >
                <h2>
                  {project.title}
                </h2>

                <p>
                  {
                    project.description
                  }
                </p>

                <p>
                  Technologies:{" "}
                  {
                    project.technologies
                  }
                </p>

                <div>
                  {project.project_url && (
                    <a
                      href={
                        project.project_url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live Project
                    </a>
                  )}

                  {" "}

                  {project.repository_url && (
                    <a
                      href={
                        project.repository_url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Repository
                    </a>
                  )}
                </div>

                <button
                  onClick={() =>
                    removeProject(
                      project.id
                    )
                  }
                >
                  Delete
                </button>
              </article>
            )
          )}
        </div>

      </div>
    </div>
  );
}

export default PortfolioProjects;