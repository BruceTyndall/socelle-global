import { Search, MessageSquare, FileText, ClipboardList, MoreHorizontal } from 'lucide-react';

const AI_TOOLS = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'explain', label: 'Explain', icon: MessageSquare },
  { id: 'brief', label: 'Brief', icon: FileText },
  { id: 'plan', label: 'Plan', icon: ClipboardList },
  { id: 'more', label: 'More', icon: MoreHorizontal },
] as const;

export function AIToolbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#141418] border-t border-[#6E879B]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 py-3">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors font-sans text-sm font-medium"
              >
                <Icon className="w-4 h-4" />
                <span>{tool.label}</span>
                <span className="text-[9px] font-semibold bg-[#A97A4C]/20 text-[#A97A4C] px-1.5 py-0.5 rounded-full leading-none">
                  DEMO
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
