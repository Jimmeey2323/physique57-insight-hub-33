
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Calendar, Target, Percent } from 'lucide-react';

interface DashboardNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    {
      id: 'sales',
      label: 'Sales Analytics',
      icon: BarChart3,
      description: 'Revenue, transactions, and performance metrics',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'funnel',
      label: 'Client Funnel',
      icon: Target,
      description: 'Conversion rates and client acquisition',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'discounts',
      label: 'Discount Analytics',
      icon: Percent,
      description: 'Discount impact and promotional analysis',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'sessions',
      label: 'Session Analytics',
      icon: Calendar,
      description: 'Class attendance and session metrics',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      id: 'trainers',
      label: 'Trainer Performance',
      icon: Users,
      description: 'Instructor metrics and performance',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <Card className="bg-white border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                className={`
                  h-auto p-4 flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105
                  ${isActive 
                    ? `bg-gradient-to-r ${tab.gradient} text-white border-0 shadow-lg` 
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => onTabChange(tab.id)}
              >
                <div className={`p-2 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="text-center">
                  <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'} mt-1`}>
                    {tab.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
