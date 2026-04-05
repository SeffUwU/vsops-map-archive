import type { Nullable } from '@/types/utils/utils.types';
import { Backpack, CircleUserRound, ClipboardList, GitPullRequestArrow, House, Users } from 'lucide-react';

const typeToIconMap = {
  users: Users,
  characters: ClipboardList,
  items: Backpack,
  profile: CircleUserRound,
  home: House,
  joinCampaign: GitPullRequestArrow,
};

interface HeaderInfoProps {
  title?: Nullable<string>;
  description?: Nullable<string>;
  type?: keyof typeof typeToIconMap;
}

export function HeaderInfo({ title, description, type }: HeaderInfoProps) {
  const Icon = type ? typeToIconMap[type] : House;

  return (
    <div className="w-full p-2 mb-2" style={{
      backgroundColor: 'hsl(var(--muted))',
      borderLeft: '1px solid hsl(var(--border))',
    }}>
      <h3 className="pb-0 flex flex-row gap-2 items-center">
        <Icon />
        {title}
      </h3>
      <p>{description}</p>
    </div>
  );
}
