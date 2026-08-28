import type { LocalProject } from "../types";

interface WelcomeScreenProps {
  onOpen: () => void;
  onCreate: () => void;
  onOpenLocal: (path: string) => void;
  onOpenOptions: () => void;
  loading: boolean;
  error: string | null;
  mobile: boolean;
  localProjects: LocalProject[];
}

export function WelcomeScreen({
  onOpen,
  onCreate,
  onOpenLocal,
  onOpenOptions,
  loading,
  error,
  mobile,
  localProjects,
}: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <img className="welcome-icon" src="/sortdraft.svg" alt="" width={72} height={72} />
      <div className="welcome-top">
        <h1>Sortdraft</h1>
        <button className="btn btn-sm" onClick={onOpenOptions}>
          Options
        </button>
      </div>
      <p>Sort your scenes, draft your story — a novel writing app with corkboard planning.</p>
      {error && <div className="welcome-error">{error}</div>}
      <div className="welcome-actions">
        <button
          className="btn btn-primary"
          onClick={onCreate}
          disabled={loading}
        >
          {loading ? "Working…" : "New Project"}
        </button>
        {!mobile && (
          <button className="btn" onClick={onOpen} disabled={loading}>
            Open Project
          </button>
        )}
      </div>
      {mobile && (
        <div className="welcome-projects">
          <h2>On this device</h2>
          {localProjects.length === 0 ? (
            <p className="welcome-projects-empty">
              Projects you create are stored on this device.
            </p>
          ) : (
            <ul className="welcome-project-list">
              {localProjects.map((project) => (
                <li key={project.path}>
                  <button
                    className="welcome-project-btn"
                    onClick={() => onOpenLocal(project.path)}
                    disabled={loading}
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
