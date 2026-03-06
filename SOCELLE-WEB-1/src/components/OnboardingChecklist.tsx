import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href?: string;
  cta?: string;
  done: boolean;
}

interface OnboardingChecklistProps {
  hasPlan: boolean;
  hasOrders: boolean;
  hasProfile: boolean;
}

const STORAGE_KEY = 'onboarding_dismissed';

export default function OnboardingChecklist({ hasPlan, hasOrders, hasProfile }: OnboardingChecklistProps) {
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const items: ChecklistItem[] = [
    {
      id: 'profile',
      label: 'Complete your profile',
      description: 'Add your spa name and contact information so brands can connect with you.',
      done: hasProfile,
    },
    {
      id: 'explore',
      label: 'Explore a brand',
      description: 'Browse Naturopathica protocols, products, and training materials.',
      href: '/portal',
      cta: 'Explore Brands',
      done: false, // Always show — no easy way to track without extra DB
    },
    {
      id: 'plan',
      label: 'Upload your menu & see brand fit',
      description: 'Get instant analysis: protocol matches, service gaps, retail opportunities, and a custom opening order.',
      href: '/portal/plans/new',
      cta: 'Upload Menu',
      done: hasPlan,
    },
    {
      id: 'calendar',
      label: 'Check the marketing calendar',
      description: 'See upcoming seasonal themes, webinars, and product launches to plan ahead.',
      href: '/portal/calendar',
      cta: 'View Calendar',
      done: false,
    },
    {
      id: 'order',
      label: 'Place your first order',
      description: 'After reviewing your plan, add recommended products to your cart and submit.',
      href: '/portal/orders',
      cta: 'View Orders',
      done: hasOrders,
    },
  ];

  const completedCount = items.filter(i => i.done).length;
  const allDone = completedCount === items.length;

  if (dismissed || allDone) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white border border-pro-stone rounded-lg shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-pro-charcoal">Getting Started</h3>
              <span className="text-xs font-medium text-pro-charcoal bg-pro-stone px-2 py-0.5 rounded-full">
                {completedCount}/{items.length} complete
              </span>
            </div>
            <div className="w-full bg-pro-stone rounded-full h-1.5 max-w-xs">
              <div
                className="bg-pro-navy h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-pro-warm-gray flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-pro-warm-gray flex-shrink-0" />
          )}
        </button>
        <button
          onClick={handleDismiss}
          className="ml-3 p-1 text-pro-warm-gray hover:text-pro-warm-gray transition-colors flex-shrink-0"
          title="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-pro-stone divide-y divide-pro-stone">
          {items.map(item => (
            <div key={item.id} className={`px-5 py-3.5 flex items-start gap-3 ${item.done ? 'opacity-60' : ''}`}>
              {item.done ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-pro-stone flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <p className={`text-sm font-medium ${item.done ? 'line-through text-pro-warm-gray' : 'text-pro-charcoal'}`}>
                    {item.label}
                  </p>
                  {!item.done && item.href && (
                    <Link
                      to={item.href}
                      className="text-xs font-medium text-pro-navy hover:text-pro-charcoal whitespace-nowrap flex-shrink-0 border border-pro-stone px-2 py-1 rounded hover:bg-pro-cream transition-colors"
                    >
                      {item.cta}
                    </Link>
                  )}
                </div>
                {!item.done && (
                  <p className="text-xs text-pro-warm-gray mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
