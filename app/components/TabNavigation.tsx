'use client';

interface Tab {
  key: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-8 justify-center">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`px-6 py-3 rounded-full font-medium border transition-all duration-200 ${
            activeTab === tab.key 
              ? 'bg-primary text-white border-primary shadow-lg transform scale-105' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation; 