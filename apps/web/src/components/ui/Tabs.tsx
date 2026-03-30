import React from 'react';

interface TabsProps {
  items: { id: string; label: string }[];
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, children, className }) => {
  const [activeTab, setActiveTab] = React.useState(items[0]?.id);

  return (
    <div className={className}>
      <div className="border-b border-gray-200 flex">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === item.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {React.Children.toArray(children).filter((child: any) => child?.props?.id === activeTab)}
      </div>
    </div>
  );
};
