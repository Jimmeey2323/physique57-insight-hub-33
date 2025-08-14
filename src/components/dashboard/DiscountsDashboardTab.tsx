
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDiscountsData } from '@/hooks/useDiscountsData';
import { DiscountMetricCards } from '@/components/dashboard/DiscountMetricCards';
import { DiscountFilterSection } from '@/components/dashboard/DiscountFilterSection';
import { DiscountAnalyticsCharts } from '@/components/dashboard/DiscountAnalyticsCharts';
import { DiscountProductTable } from '@/components/dashboard/DiscountProductTable';
import { DiscountCategoryTable } from '@/components/dashboard/DiscountCategoryTable';
import { DiscountAssociateTable } from '@/components/dashboard/DiscountAssociateTable';
import { DiscountYearComparisonTable } from '@/components/dashboard/DiscountYearComparisonTable';
import { DrillDownModal } from '@/components/dashboard/DrillDownModal';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';
import { Percent, TrendingDown, Users, Package, Calendar, BarChart3 } from 'lucide-react';

interface DiscountFilters {
  dateRange: { start: string; end: string };
  location: string[];
  paymentMethod: string[];
  category: string[];
  product: string[];
  soldBy: string[];
  minDiscount?: number;
  maxDiscount?: number;
  discountRange: string[];
}

export const DiscountsDashboardTab: React.FC = () => {
  const { data, loading, error } = useDiscountsData();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  
  // Initialize filters with previous month dates
  const [filters, setFilters] = useState<DiscountFilters>(() => {
    const previousMonth = getPreviousMonthDateRange();
    return {
      dateRange: previousMonth,
      location: [],
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
    data: null as any,
    type: 'product' as any
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    
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

    return result;
  }, [data, filters, selectedLocation]);

  const handleDrillDown = (item: any) => {
    setDrillDownModal({
      isOpen: true,
      data: item,
      type: 'product'
    });
  };

  if (loading) {
    return <RefinedLoader subtitle="Loading discount analytics..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
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
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Percent className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Discount Analytics</h2>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {filteredData.length} transactions
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-90">Total Discounts</div>
              <div className="text-xl font-bold">
                {formatCurrency(filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0))}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-90">Discounted Sales</div>
              <div className="text-xl font-bold">
                {formatNumber(filteredData.filter(item => (item.discountAmount || 0) > 0).length)}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-90">Avg Discount %</div>
              <div className="text-xl font-bold">
                {formatPercentage(
                  filteredData.filter(item => (item.discountPercentage || 0) > 0).length > 0
                    ? filteredData.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / 
                      filteredData.filter(item => (item.discountPercentage || 0) > 0).length
                    : 0
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-90">Revenue Impact</div>
              <div className="text-xl font-bold">
                {formatCurrency(filteredData.reduce((sum, item) => sum + (item.paymentValue || 0), 0))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <DiscountFilterSection
        data={data || []}
        onFiltersChange={setFilters}
        isCollapsed={isFiltersCollapsed}
        onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
      />

      {/* Location Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Location Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLocation === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLocation('all')}
            >
              All Locations
            </Button>
            {Array.from(new Set(data?.map(item => item.calculatedLocation).filter(Boolean) || [])).map(location => (
              <Button
                key={location}
                variant={selectedLocation === location ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLocation(location)}
              >
                {location}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <DiscountMetricCards
        data={filteredData}
        filters={filters}
        onDrillDown={handleDrillDown}
      />

      {/* Charts Section */}
      <DiscountAnalyticsCharts
        data={filteredData}
        filters={filters}
      />

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiscountProductTable
          data={filteredData}
          filters={filters}
          onRowClick={handleDrillDown}
        />
        
        <DiscountCategoryTable
          data={filteredData}
          filters={filters}
          onRowClick={handleDrillDown}
        />
      </div>

      <DiscountAssociateTable
        data={filteredData}
        filters={filters}
        onRowClick={handleDrillDown}
      />

      <DiscountYearComparisonTable
        data={filteredData}
        filters={filters}
        onRowClick={handleDrillDown}
      />

      {/* Drill Down Modal */}
      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({
          isOpen: false,
          data: null,
          type: 'product'
        })}
        data={drillDownModal.data}
        type={drillDownModal.type}
      />
    </div>
  );
};
