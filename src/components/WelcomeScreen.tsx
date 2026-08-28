interface WelcomeScreenProps {
  onOpen: () => void;
  onCreate: () => void;
  onOpenOptions: () => void;
  loading: boolean;
  error: string | null;
}

export function WelcomeScreen({
  onOpen,
  onCreate,
  onOpenOptions,
  loading,
  error,
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
        <button className="btn" onClick={onOpen} disabled={loading}>
          Open Project
        </button>
      </div>
    </div>
  );
}
