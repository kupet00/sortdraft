import { useEffect, useRef } from "react";

interface PromptDialogProps {
  title: string;
  label: string;
  defaultValue?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({
  title,
  label,
  defaultValue = "",
  confirmLabel = "OK",
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim() ?? "";
    if (value) onConfirm(value);
  };

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <label className="dialog-label">
            {label}
            <input
              ref={inputRef}
              type="text"
              defaultValue={defaultValue}
              placeholder={label}
            />
          </label>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
