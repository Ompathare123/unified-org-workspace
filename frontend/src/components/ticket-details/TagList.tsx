import React from "react";

interface TagListProps {
  tags?: string[];
}

export const TagList: React.FC<TagListProps> = ({
  tags = ["security", "api", "external"],
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export default TagList;
