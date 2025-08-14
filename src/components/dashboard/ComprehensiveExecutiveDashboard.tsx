
import React, { useState } from 'react';
import { DashboardNavigation } from './DashboardNavigation';
import { SalesAnalyticsSection } from './SalesAnalyticsSection';
import { NewClientSection } from './NewClientSection';
import { DiscountsDashboardTab } from './DiscountsDashboardTab';
import { SessionsSection } from './SessionsSection';
import { TrainerPerformanceSection } from './TrainerPerformanceSection';
import { useSalesData } from '@/hooks/useSalesData';
import { useNewClientData } from '@/hooks/useNewClientData';

export const ComprehensiveExecutiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const { data: salesData } = useSalesData();
  const { data: newClientData } = useNewClientData();

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesAnalyticsSection data={salesData || []} />;
      case 'funnel':
        return <NewClientSection data={newClientData || []} />;
      case 'discounts':
        return <DiscountsDashboardTab />;
      case 'sessions':
        return <SessionsSection />;
      case 'trainers':
        return <TrainerPerformanceSection />;
      default:
        return <SalesAnalyticsSection data={salesData || []} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Executive Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive analytics and insights across all business metrics
          </p>
        </div>

        <DashboardNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <div className="transition-all duration-500 ease-in-out">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
