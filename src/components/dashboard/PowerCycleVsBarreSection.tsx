
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PowerCycleVsBarreEnhancedFilterSection } from './PowerCycleVsBarreEnhancedFilterSection';
import { PowerCycleVsBarreComparison } from './PowerCycleVsBarreComparison';
import { PowerCycleVsBarreMetrics } from './PowerCycleVsBarreMetrics';
import { PowerCycleVsBarreCharts } from './PowerCycleVsBarreCharts';
import { PowerCycleVsBarreTopBottomLists } from './PowerCycleVsBarreTopBottomLists';
import { PowerCycleVsBarreDataTable } from './PowerCycleVsBarreDataTable';
import { DrillDownModal } from './DrillDownModal';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { useFilteredSessionsData } from '@/hooks/useFilteredSessionsData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useLoading } from '@/contexts/LoadingContext';
import { TrendingUp, BarChart3, Activity, Users, Eye } from 'lucide-react';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

export const PowerCycleVsBarreSection: React.FC = () => {
  const { setLoading } = useLoading();
  const { data: rawData, loading, error } = useSessionsData();
  const filteredData = useFilteredSessionsData(rawData);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [showSourceData, setShowSourceData] = useState(false);

  React.useEffect(() => {
    setLoading(loading, 'Loading PowerCycle vs Barre comparison data...');
  }, [loading, setLoading]);

  // Filter for PowerCycle and Barre classes only
  const powerCycleVsBarreData = React.useMemo(() => {
    if (!filteredData) return [];
    
    return filteredData.filter(session => {
      const className = session.cleanedClass?.toLowerCase() || '';
      return className.includes('powercycle') || className.includes('barre');
    });
  }, [filteredData]);

  const handleItemClick = (item: any) => {
    setDrillDownData(item);
  };

  if (loading) {
    return <RefinedLoader message="Loading PowerCycle vs Barre analysis..." />;
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filter Section */}
      <PowerCycleVsBarreEnhancedFilterSection data={rawData || []} />

      {/* Metrics Section */}
      <PowerCycleVsBarreMetrics data={powerCycleVsBarreData} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-sm font-medium">
                <Activity className="w-4 h-4 mr-2" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="detailed" className="text-sm font-medium">
                <Eye className="w-4 h-4 mr-2" />
                Detailed View
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="overview" className="space-y-8">
          <PowerCycleVsBarreComparison data={powerCycleVsBarreData} />
          <PowerCycleVsBarreCharts data={powerCycleVsBarreData} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-8">
          <PowerCycleVsBarreComparison data={powerCycleVsBarreData} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-8">
          <PowerCycleVsBarreCharts data={powerCycleVsBarreData} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-8">
          <PowerCycleVsBarreTopBottomLists data={powerCycleVsBarreData} onItemClick={handleItemClick} />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-8">
          <PowerCycleVsBarreDataTable data={powerCycleVsBarreData} onItemClick={handleItemClick} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {drillDownData && (
        <DrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
          type="powercycle-barre"
        />
      )}

      {showSourceData && (
        <SourceDataModal
          open={showSourceData}
          onOpenChange={setShowSourceData}
          sources={[
            {
              name: "PowerCycle vs Barre Sessions",
              data: powerCycleVsBarreData
            }
          ]}
        />
      )}
    </div>
  );
};
