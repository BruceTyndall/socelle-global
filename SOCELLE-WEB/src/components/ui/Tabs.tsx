import { createContext, useContext, useState, HTMLAttributes } from 'react';

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue>({ active: '', setActive: () => {} });

interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  defaultTab: string;
  onChange?: (id: string) => void;
}

export function Tabs({ defaultTab, onChange, className = '', children, ...props }: TabsProps) {
  const [active, setActive] = useState(defaultTab);
  const handleSet = (id: string) => {
    setActive(id);
    onChange?.(id);
  };
  return (
    <TabsContext.Provider value={{ active, setActive: handleSet }}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex gap-1 border-b border-pro-stone ${className}`} {...props}>
      {children}
    </div>
  );
}

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  id: string;
}

export function Tab({ id, className = '', children, ...props }: TabProps) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === id;
  return (
    <button
      onClick={() => setActive(id)}
      className={`px-4 py-2.5 text-sm font-medium font-sans border-b-2 transition-colors -mb-px ${
        isActive
          ? 'border-pro-navy text-pro-navy'
          : 'border-transparent text-pro-warm-gray hover:text-pro-charcoal hover:border-pro-stone'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TabPanel({ id, className = '', children, ...props }: TabPanelProps) {
  const { active } = useContext(TabsContext);
  if (active !== id) return null;
  return <div className={className} {...props}>{children}</div>;
}
