import { Layers } from 'lucide-react';

export default function DataGovernance() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
        <Layers size={22} strokeWidth={1.5} className="text-accent-interactive" />
      </div>
      <h1 className="text-xl font-medium text-foreground mb-2">Data & Governance</h1>
      <p className="text-sm text-foreground/50 max-w-sm">
        Connectors, schema browser, consent controls, and event logs coming in a future build.
      </p>
    </div>
  );
}
