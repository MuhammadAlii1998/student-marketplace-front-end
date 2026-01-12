import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  href: string;
  count?: number;
  color?: string;
}

export function CategoryCard({ name, icon: Icon, href, count, color }: CategoryCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group flex flex-col items-center justify-center p-6 rounded-xl border border-border/50 bg-card',
        'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/50'
      )}
    >
      <div
        className={cn(
          'h-14 w-14 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110',
          color || 'bg-primary/10'
        )}
      >
        <Icon className={cn('h-7 w-7', color ? 'text-primary-foreground' : 'text-primary')} />
      </div>
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
        {name}
      </h3>
      {count !== undefined && <p className="text-sm text-muted-foreground">{count} items</p>}
    </Link>
  );
}
