import { type ReactNode } from 'react';

interface StickyCard {
  id: string;
  content: ReactNode;
  bg?: string;
  textColor?: string;
}

interface StickyCardStackProps {
  cards: StickyCard[];
  className?: string;
}

export default function StickyCardStack({ cards, className = '' }: StickyCardStackProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ height: `${cards.length * 100}vh` }}
    >
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={`sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden ${card.bg || 'bg-mn-bg'} ${card.textColor || 'text-graphite'}`}
          style={{ zIndex: i + 1 }}
        >
          <div className="section-container w-full">
            {card.content}
          </div>
        </div>
      ))}
    </div>
  );
}
