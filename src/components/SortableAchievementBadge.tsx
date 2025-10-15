import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AchievementBadge } from "./AchievementBadge";
import { Award, GripVertical } from "lucide-react";

interface SortableAchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon?: React.ReactNode;
}

export const SortableAchievementBadge = ({
  id,
  title,
  description,
  unlocked,
  icon,
}: SortableAchievementBadgeProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-muted rounded p-1"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <AchievementBadge
        title={title}
        description={description}
        unlocked={unlocked}
        icon={icon || <Award className="h-6 w-6" />}
      />
    </div>
  );
};
