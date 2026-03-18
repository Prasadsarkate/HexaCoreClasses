import type { SubjectType } from '@/types/types';
import { Button } from '@/components/ui/button';

interface SubjectFilterProps {
  selected: SubjectType | 'All';
  onSelect: (subject: SubjectType | 'All') => void;
}

const subjects: (SubjectType | 'All')[] = ['All', 'NEET', 'Python', 'Java'];

export default function SubjectFilter({ selected, onSelect }: SubjectFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 smooth-scroll">
      {subjects.map((subject) => (
        <Button
          key={subject}
          variant={selected === subject ? 'default' : 'outline'}
          onClick={() => onSelect(subject)}
          className="rounded-[1.25rem] min-w-fit whitespace-nowrap"
          size="sm"
        >
          {subject}
        </Button>
      ))}
    </div>
  );
}
