
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
import { useSessionsFilters } from '@/contexts/SessionsFiltersContext';

export const PowerCycleVsBarreSection: React.FC = () => {
  const { data, loading, error } = useSessionsData();
  const { setLoading } = useGlobalLoading();
  const { filters } = useSessionsFilters();
  
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

    // Apply trainers filter
    if (filters.trainers.length > 0) {
      result = result.filter(session => filters.trainers.includes(session.trainerName));
    }

    // Apply class types filter
    if (filters.classTypes.length > 0) {
      result = result.filter(session => filters.classTypes.includes(session.cleanedClass));
    }

    // Apply day of week filter
    if (filters.dayOfWeek.length > 0) {
      result = result.filter(session => filters.dayOfWeek.includes(session.dayOfWeek));
    }

    // Apply time slots filter
    if (filters.timeSlots.length > 0) {
      result = result.filter(session => filters.timeSlots.includes(session.time));
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

  // Calculate metrics for PowerCycle
  const powerCycleMetrics = useMemo(() => {
    const totalSessions = powerCycleData.length;
    const totalAttendance = powerCycleData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalCapacity = powerCycleData.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalBookings = powerCycleData.reduce((sum, session) => sum + (session.bookedCount || 0), 0);
    const emptySessions = powerCycleData.filter(session => (session.checkedInCount || 0) === 0).length;
    const avgFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
    const avgSessionSize = totalSessions > 0 ? totalAttendance / totalSessions : 0;
    const nonEmptySessions = totalSessions - emptySessions;
    const avgSessionSizeExclEmpty = nonEmptySessions > 0 ? totalAttendance / nonEmptySessions : 0;
    const noShows = totalBookings - totalAttendance;

    return {
      totalSessions,
      totalAttendance,
      totalCapacity,
      totalBookings,
      emptySessions,
      avgFillRate,
      avgSessionSize,
      avgSessionSizeExclEmpty,
      noShows
    };
  }, [powerCycleData]);

  // Calculate metrics for Barre
  const barreMetrics = useMemo(() => {
    const totalSessions = barreData.length;
    const totalAttendance = barreData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalCapacity = barreData.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalBookings = barreData.reduce((sum, session) => sum + (session.bookedCount || 0), 0);
    const emptySessions = barreData.filter(session => (session.checkedInCount || 0) === 0).length;
    const avgFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
    const avgSessionSize = totalSessions > 0 ? totalAttendance / totalSessions : 0;
    const nonEmptySessions = totalSessions - emptySessions;
    const avgSessionSizeExclEmpty = nonEmptySessions > 0 ? totalAttendance / nonEmptySessions : 0;
    const noShows = totalBookings - totalAttendance;

    return {
      totalSessions,
      totalAttendance,
      totalCapacity,
      totalBookings,
      emptySessions,
      avgFillRate,
      avgSessionSize,
      avgSessionSizeExclEmpty,
      noShows
    };
  }, [barreData]);

  const handleDrillDown = (item: any) => {
    setDrillDownModal({
      isOpen: true,
      title: `${item.cleanedClass} - ${item.trainerName}`,
      data: [item],
      type: 'metric'
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
      <PowerCycleVsBarreFilterSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PowerCycleVsBarreComparison 
          powerCycleMetrics={powerCycleMetrics}
          barreMetrics={barreMetrics}
          onItemClick={handleDrillDown}
        />
        <PowerCycleVsBarreCharts 
          powerCycleData={powerCycleData}
          barreData={barreData}
        />
      </div>

      <PowerCycleVsBarreTopBottomLists 
        powerCycleData={powerCycleData}
        barreData={barreData}
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
        type={drillDownModal.type}
      />
    </div>
  );
};
