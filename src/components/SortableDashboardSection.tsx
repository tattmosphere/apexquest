import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

interface SortableDashboardSectionProps {
  id: string;
  children: ReactNode;
}

export const SortableDashboardSection = ({
  id,
  children,
}: SortableDashboardSectionProps) => {
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
        className="absolute -left-4 top-4 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded p-2 shadow-lg"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      {children}
    </div>
  );
};
