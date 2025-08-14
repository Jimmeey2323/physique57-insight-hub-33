import React, { useEffect, useMemo, useState } from 'react';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useDiscountsData } from '@/hooks/useDiscountsData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { DiscountFilterSection } from '@/components/dashboard/DiscountFilterSection';
import { DiscountLocationSelector } from '@/components/dashboard/DiscountLocationSelector';
import { DiscountMetricCards } from '@/components/dashboard/DiscountMetricCards';
import { DiscountInteractiveCharts } from '@/components/dashboard/DiscountInteractiveCharts';
import { DiscountInteractiveTopBottomLists } from '@/components/dashboard/DiscountInteractiveTopBottomLists';
import { DiscountMonthOnMonthTable } from '@/components/dashboard/DiscountMonthOnMonthTable';
import { DiscountYearOnYearTable } from '@/components/dashboard/DiscountYearOnYearTable';
import { DiscountDataTable } from '@/components/dashboard/DiscountDataTable';
import { DrillDownModal } from '@/components/dashboard/DrillDownModal';
import { EnhancedStickyNotes } from '@/components/ui/EnhancedStickyNotes';
import { Button } from '@/components/ui/button';
import { Home, TrendingDown, Percent, DollarSign, Package, Target, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

interface DiscountFilters {
  dateRange: { start: string; end: string };
  paymentMethod: string[];
  category: string[];
  product: string[];
  soldBy: string[];
  minDiscount?: number;
  maxDiscount?: number;
  discountRange: string[];
}

const DiscountsPromotions: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading } = useGlobalLoading();
  const { data, loading, error } = useDiscountsData();
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  
  // Initialize filters with previous month dates
  const [filters, setFilters] = useState<DiscountFilters>(() => {
    const previousMonth = getPreviousMonthDateRange();
    return {
      dateRange: previousMonth,
      paymentMethod: [],
      category: [],
      product: [],
      soldBy: [],
      minDiscount: undefined,
      maxDiscount: undefined,
      discountRange: []
    };
  });

  const [drillDownModal, setDrillDownModal] = useState({
    isOpen: false,
    data: null,
    type: ''
  });

  useEffect(() => {
    setLoading(loading, 'Loading discount and promotional data...');
  }, [loading, setLoading]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    console.log('Raw discount data:', data.length, 'items');
    
    let result = data;

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      result = result.filter(item => {
        if (!item.paymentDate) return false;
        
        let itemDate: Date;
        if (item.paymentDate.includes('/')) {
          const [day, month, year] = item.paymentDate.split(' ')[0].split('/');
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          itemDate = new Date(item.paymentDate);
        }
        
        if (isNaN(itemDate.getTime())) return false;
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    // Apply location filter
    if (selectedLocation !== 'all') {
      result = result.filter(item => item.calculatedLocation === selectedLocation);
    }

    // Apply other filters
    if (filters.paymentMethod.length) {
      result = result.filter(item => filters.paymentMethod.includes(item.paymentMethod));
    }

    if (filters.category.length) {
      result = result.filter(item => filters.category.includes(item.cleanedCategory));
    }

    if (filters.product.length) {
      result = result.filter(item => filters.product.includes(item.cleanedProduct));
    }

    if (filters.soldBy.length) {
      result = result.filter(item => filters.soldBy.includes(item.soldBy));
    }

    if (filters.minDiscount !== undefined) {
      result = result.filter(item => (item.discountAmount || 0) >= filters.minDiscount!);
    }

    if (filters.maxDiscount !== undefined) {
      result = result.filter(item => (item.discountAmount || 0) <= filters.maxDiscount!);
    }

    console.log('Filtered discount data:', result.length, 'items');
    return result;
  }, [data, filters, selectedLocation]);

  const heroMetrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        totalTransactions: 0,
        totalRevenue: 0,
        totalDiscounts: 0,
        avgDiscountPercent: 0,
        discountedTransactions: 0,
        avgTransactionValue: 0
      };
    }

    const totalTransactions = filteredData.length;
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalDiscounts = filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const discountedTransactions = filteredData.filter(item => (item.discountAmount || 0) > 0).length;
    
    const totalDiscountPercent = filteredData.reduce((sum, item) => sum + (item.discountPercentage || 0), 0);
    const avgDiscountPercent = discountedTransactions > 0 ? totalDiscountPercent / discountedTransactions : 0;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalTransactions,
      totalRevenue,
      totalDiscounts,
      avgDiscountPercent,
      discountedTransactions,
      avgTransactionValue
    };
  }, [filteredData]);

  const handleDrillDown = (title: string, data: any[], type: string) => {
    setDrillDownModal({
      isOpen: true,
      data,
      type
    });
  };

  if (loading) {
    return <RefinedLoader subtitle="Loading discount and promotional analysis..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading discount data: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20 relative">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-800 via-red-800 to-pink-800">
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="absolute top-6 left-6 flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline" size="sm" className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
            
            <Button 
              onClick={() => setShowStickyNotes(!showStickyNotes)}
              variant="outline" 
              size="sm" 
              className={`gap-2 backdrop-blur-sm border-white/20 text-white hover:border-white/30 transition-all duration-200 ${
                showStickyNotes 
                  ? 'bg-white/20 border-white/30' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              {showStickyNotes ? 'Hide' : 'Show'} Notes
            </Button>
          </div>

          <div className="text-center text-white animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Percent className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent">
                Discounts & Promotions
              </h1>
            </div>
            
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive analysis of discount strategies and promotional impact across all sales channels
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 animate-fade-in-up delay-500">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-orange-300" />
                  <span className="text-xs font-medium text-orange-200">Total Transactions</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(heroMetrics.totalTransactions)}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-300" />
                  <span className="text-xs font-medium text-green-200">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(heroMetrics.totalRevenue)}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-300" />
                  <span className="text-xs font-medium text-red-200">Total Discounts</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(heroMetrics.totalDiscounts)}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5 text-blue-300" />
                  <span className="text-xs font-medium text-blue-200">Avg Discount %</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatPercentage(heroMetrics.avgDiscountPercent)}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-300" />
                  <span className="text-xs font-medium text-purple-200">Discounted Sales</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(heroMetrics.discountedTransactions)}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-300" />
                  <span className="text-xs font-medium text-yellow-200">Avg Transaction</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(heroMetrics.avgTransactionValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <DiscountFilterSection
            data={data || []}
            onFiltersChange={setFilters}
            isCollapsed={isFiltersCollapsed}
            onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
          />

          <DiscountLocationSelector
            data={data || []}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />

          <DiscountMetricCards
            data={filteredData}
            filters={filters}
            onDrillDown={handleDrillDown}
          />

          <DiscountInteractiveCharts
            data={filteredData}
            filters={filters}
          />

          <DiscountInteractiveTopBottomLists
            data={filteredData}
            filters={filters}
            onDrillDown={handleDrillDown}
          />

          <DiscountMonthOnMonthTable
            data={filteredData}
            filters={filters}
          />

          <DiscountYearOnYearTable
            data={filteredData}
            filters={filters}
          />

          <DiscountDataTable
            data={filteredData}
            filters={filters}
          />
        </main>
      </div>
      
      {showStickyNotes && (
        <EnhancedStickyNotes />
      )}
      
      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({ ...drillDownModal, isOpen: false })}
        data={drillDownModal.data}
        type="product"
      />
    </div>
  );
};

export default DiscountsPromotions;
