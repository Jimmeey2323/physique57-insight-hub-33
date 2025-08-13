
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, BarChart3, Calendar, TrendingUp, Users, Target, Clock, Activity } from 'lucide-react';
import { PowerCycleVsBarreMetricCards } from './PowerCycleVsBarreMetricCards';
import { PowerCycleVsBarreComparison } from './PowerCycleVsBarreComparison';
import { PowerCycleVsBarreTables } from './PowerCycleVsBarreTables';
import { PowerCycleVsBarreTopBottomListsWrapper } from './PowerCycleVsBarreTopBottomListsWrapper';
import { EnhancedTrainerDrillDownModal } from './EnhancedTrainerDrillDownModal';
import { useSessionsData, SessionData } from '@/hooks/useSessionsData';
import { useFilteredSessionsData } from '@/hooks/useFilteredSessionsData';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';
import { SessionData as DashboardSessionData } from '@/types/dashboard';

const PowerCycleVsBarreSection = () => {
  const [selectedTab, setSelectedTab] = useState('metrics');
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  
  const { data: sessionsData, loading, error } = useSessionsData();
  const filteredSessions = useFilteredSessionsData(sessionsData);

  // Transform hook SessionData to dashboard SessionData format
  const transformSessionData = (sessions: SessionData[]): DashboardSessionData[] => {
    return sessions.map(session => ({
      sessionId: session.sessionId,
      date: session.date,
      time: session.time,
      classType: session.classType,
      cleanedClass: session.cleanedClass,
      instructor: session.trainerName, // Map trainerName to instructor
      location: session.location,
      capacity: session.capacity,
      booked: session.bookedCount || 0, // Map bookedCount to booked
      checkedIn: session.checkedInCount, // Map checkedInCount to checkedIn
      checkedInCount: session.checkedInCount,
      waitlisted: 0, // Default value
      waitlist: 0, // Default value
      noShows: Math.max(0, (session.bookedCount || 0) - session.checkedInCount),
      fillPercentage: session.fillPercentage || 0,
      sessionCount: 1,
      totalAttendees: session.checkedInCount
    }));
  };

  // Separate PowerCycle and Barre data
  const { powerCycleData, barreData } = useMemo(() => {
    if (!filteredSessions || filteredSessions.length === 0) {
      return { powerCycleData: [], barreData: [] };
    }

    const powerCycle = filteredSessions.filter(session => {
      const className = session.cleanedClass?.toLowerCase() || '';
      return className.includes('cycle') || className.includes('power');
    });

    const barre = filteredSessions.filter(session => {
      const className = session.cleanedClass?.toLowerCase() || '';
      return className.includes('barre');
    });

    return { 
      powerCycleData: transformSessionData(powerCycle), 
      barreData: transformSessionData(barre) 
    };
  }, [filteredSessions]);

  // Calculate metrics for comparison component
  const comparisonMetrics = useMemo(() => {
    const calculateMetrics = (data: SessionData[]) => ({
      totalSessions: data.length,
      totalAttendance: data.reduce((sum, s) => sum + s.checkedInCount, 0),
      totalCapacity: data.reduce((sum, s) => sum + s.capacity, 0),
      totalBookings: data.reduce((sum, s) => sum + (s.bookedCount || 0), 0),
      emptySessions: data.filter(s => s.checkedInCount === 0).length,
      avgFillRate: data.length > 0 ? (data.reduce((sum, s) => sum + (s.fillPercentage || 0), 0) / data.length) : 0,
      avgSessionSize: data.length > 0 ? (data.reduce((sum, s) => sum + s.checkedInCount, 0) / data.length) : 0,
      avgSessionSizeExclEmpty: (() => {
        const nonEmpty = data.filter(s => s.checkedInCount > 0);
        return nonEmpty.length > 0 ? (nonEmpty.reduce((sum, s) => sum + s.checkedInCount, 0) / nonEmpty.length) : 0;
      })(),
      noShows: data.reduce((sum, s) => sum + Math.max(0, (s.bookedCount || 0) - s.checkedInCount), 0)
    });

    // Use original filtered sessions for metrics calculation
    const powerCycleOriginal = filteredSessions.filter(session => {
      const className = session.cleanedClass?.toLowerCase() || '';
      return className.includes('cycle') || className.includes('power');
    });

    const barreOriginal = filteredSessions.filter(session => {
      const className = session.cleanedClass?.toLowerCase() || '';
      return className.includes('barre');
    });

    return {
      powerCycleMetrics: calculateMetrics(powerCycleOriginal),
      barreMetrics: calculateMetrics(barreOriginal)
    };
  }, [filteredSessions]);

  const handleItemClick = (item: any) => {
    setSelectedTrainer(item);
    setIsDrillDownOpen(true);
  };

  const handleRowClick = (item: any) => {
    setSelectedTrainer(item);
    setIsDrillDownOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading sessions data: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-700 rounded-3xl text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-10 w-24 h-24 bg-indigo-300/20 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute bottom-10 left-20 w-40 h-40 bg-purple-300/10 rounded-full animate-pulse delay-500"></div>
          </div>
          
          <div className="relative p-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <Zap className="w-6 h-6" />
                <span className="font-semibold text-lg">PowerCycle vs Barre Analytics</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                Class Format Comparison
              </h1>
              
              <p className="text-xl text-indigo-100 max-w-4xl mx-auto leading-relaxed">
                Comprehensive analysis comparing PowerCycle and Barre class performance, attendance, and trainer metrics
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Real-time Analytics
                </Badge>
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-4 py-2">
                  <Activity className="w-4 h-4 mr-2" />
                  {filteredSessions.length} Total Sessions
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30 px-4 py-2">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  PowerCycle: {powerCycleData.length} | Barre: {barreData.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 text-white border-0">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              PowerCycle vs Barre Performance Analysis
              <Badge className="bg-white/20 text-white backdrop-blur-sm px-3 py-1">
                Comparative Analytics
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-4 w-full max-w-2xl mx-auto overflow-hidden mb-8">
                <TabsTrigger value="metrics" className="rounded-xl px-4 py-3 font-semibold text-sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Key Metrics
                </TabsTrigger>
                <TabsTrigger value="comparison" className="rounded-xl px-4 py-3 font-semibold text-sm">
                  <Target className="w-4 h-4 mr-2" />
                  Comparison
                </TabsTrigger>
                <TabsTrigger value="tables" className="rounded-xl px-4 py-3 font-semibold text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Data Tables
                </TabsTrigger>
                <TabsTrigger value="rankings" className="rounded-xl px-4 py-3 font-semibold text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Rankings
                </TabsTrigger>
              </TabsList>

              <div className="space-y-6">
                <TabsContent value="metrics" className="space-y-6 mt-0">
                  <PowerCycleVsBarreMetricCards 
                    data={[...powerCycleData, ...barreData]}
                    onCardClick={handleItemClick}
                  />
                </TabsContent>

                <TabsContent value="comparison" className="space-y-6 mt-0">
                  <PowerCycleVsBarreComparison 
                    powerCycleMetrics={comparisonMetrics.powerCycleMetrics}
                    barreMetrics={comparisonMetrics.barreMetrics}
                    onItemClick={handleItemClick}
                  />
                </TabsContent>

                <TabsContent value="tables" className="space-y-6 mt-0">
                  <PowerCycleVsBarreTables 
                    powerCycleData={powerCycleData}
                    barreData={barreData}
                    salesData={[]}
                    payrollData={[]}
                    onItemClick={handleRowClick}
                  />
                </TabsContent>

                <TabsContent value="rankings" className="space-y-6 mt-0">
                  <PowerCycleVsBarreTopBottomListsWrapper 
                    powerCycleData={powerCycleData}
                    barreData={barreData}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Drill Down Modal */}
        {selectedTrainer && (
          <EnhancedTrainerDrillDownModal
            trainerData={selectedTrainer}
            trainerName={selectedTrainer.name || selectedTrainer.trainerName || 'Unknown Trainer'}
            isOpen={isDrillDownOpen}
            onClose={() => setIsDrillDownOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PowerCycleVsBarreSection;
