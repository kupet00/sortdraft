import type { TagDefinition } from "../types";
import { tagTextColor } from "../utils/tagColors";

interface TagPillsProps {
  tags: TagDefinition[];
  selectedIds: string[];
}

export function TagPills({ tags, selectedIds }: TagPillsProps) {
  const visible = tags.filter((tag) => selectedIds.includes(tag.id));

  if (visible.length === 0) return null;

  return (
    <div className="tag-pills">
      {visible.map((tag) => (
        <span
          key={tag.id}
          className="tag-pill"
          style={{
            backgroundColor: tag.color,
            color: tagTextColor(tag.color),
          }}
          title={tag.name}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}
