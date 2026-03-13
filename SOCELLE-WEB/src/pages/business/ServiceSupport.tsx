import { LifeBuoy } from 'lucide-react';

export default function ServiceSupport() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
        <LifeBuoy size={22} strokeWidth={1.5} className="text-accent-interactive" />
      </div>
      <h1 className="text-xl font-medium text-foreground mb-2">Service & Support</h1>
      <p className="text-sm text-foreground/50 max-w-sm">
        Tickets, issues, and NPS tracking coming in a future build.
      </p>
    </div>
  );
}
