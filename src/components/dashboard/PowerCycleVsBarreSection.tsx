
import React, { useState, useMemo } from 'react';
import { useSessionsData } from '@/hooks/useSessionsData';
import { PowerCycleVsBarreFilterSection } from './PowerCycleVsBarreFilterSection';
import { PowerCycleVsBarreComparison } from './PowerCycleVsBarreComparison';
import { PowerCycleVsBarreCharts } from './PowerCycleVsBarreCharts';
import { PowerCycleVsBarreTopBottomLists } from './PowerCycleVsBarreTopBottomLists';
import { DrillDownModal } from './DrillDownModal';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

interface PowerCycleVsBarreFilters {
  dateRange: { start: string; end: string };
  location: string[];
  instructor: string[];
}

export const PowerCycleVsBarreSection: React.FC = () => {
  const { data, loading, error } = useSessionsData();
  const { setLoading } = useGlobalLoading();
  
  // Initialize filters with previous month dates
  const [filters, setFilters] = useState<PowerCycleVsBarreFilters>(() => {
    const previousMonth = getPreviousMonthDateRange();
    return {
      dateRange: previousMonth,
      location: [],
      instructor: []
    };
  });
  
  const [drillDownModal, setDrillDownModal] = useState({
    isOpen: false,
    title: '',
    data: [],
    type: 'metric' as any
  });

  React.useEffect(() => {
    setLoading(loading, 'Loading PowerCycle vs Barre data...');
  }, [loading, setLoading]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let result = data;

    // Apply date filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      
      result = result.filter(session => {
        const sessionDate = new Date(session.date);
        if (startDate && sessionDate < startDate) return false;
        if (endDate && sessionDate > endDate) return false;
        return true;
      });
    }

    // Apply location filter
    if (filters.location.length > 0) {
      result = result.filter(session => filters.location.includes(session.location));
    }

    // Apply instructor filter
    if (filters.instructor.length > 0) {
      result = result.filter(session => filters.instructor.includes(session.instructor));
    }

    return result;
  }, [data, filters]);

  const powerCycleData = useMemo(() => {
    return filteredData.filter(session => 
      session.cleanedClass?.toLowerCase().includes('powercycle') || 
      session.cleanedClass?.toLowerCase().includes('power cycle')
    );
  }, [filteredData]);

  const barreData = useMemo(() => {
    return filteredData.filter(session => 
      session.cleanedClass?.toLowerCase().includes('barre')
    );
  }, [filteredData]);

  const handleDrillDown = (title: string, data: any[], type: string) => {
    setDrillDownModal({
      isOpen: true,
      title,
      data,
      type: type as any
    });
  };

  if (loading) {
    return <RefinedLoader subtitle="Loading PowerCycle vs Barre analysis..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PowerCycleVsBarreFilterSection
        data={data || []}
        onFiltersChange={setFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PowerCycleVsBarreComparison 
          data={filteredData}
        />
        <PowerCycleVsBarreCharts 
          data={filteredData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PowerCycleVsBarreComparison 
          data={filteredData}
        />
        
        <PowerCycleVsBarreCharts 
          data={filteredData}
        />
      </div>

      <PowerCycleVsBarreTopBottomLists 
        data={filteredData}
        onItemClick={handleDrillDown}
      />

      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({
          isOpen: false,
          title: '',
          data: [],
          type: 'metric'
        })}
        data={drillDownModal.data}
        type="metric"
      />
    </div>
  );
};
