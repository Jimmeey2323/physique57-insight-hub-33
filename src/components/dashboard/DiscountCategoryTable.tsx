
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiscountCategoryTableProps {
  data: SalesData[];
  filters?: any;
  onRowClick?: (row: any) => void;
}

export const DiscountCategoryTable: React.FC<DiscountCategoryTableProps> = ({ 
  data, 
  filters, 
  onRowClick 
}) => {
  const processedData = useMemo(() => {
    // Group by month and category
    const monthlyCategoryData = data.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const category = item.cleanedCategory || 'Unknown Category';
      const key = `${monthKey}-${category}`;
      
      if (!acc[key]) {
        acc[key] = {
          month: monthName,
          category,
          discountedTransactions: 0,
          totalTransactions: 0,
          discountValue: 0,
          discountPercent: 0,
          discountedMembers: new Set(),
          totalMembers: new Set(),
          discountedRevenue: 0,
          totalRevenue: 0
        };
      }

      // All transactions
      acc[key].totalTransactions += 1;
      acc[key].totalMembers.add(item.customerEmail);
      acc[key].totalRevenue += item.paymentValue || 0;

      // Discounted transactions
      if ((item.discountAmount || 0) > 0) {
        acc[key].discountedTransactions += 1;
        acc[key].discountValue += item.discountAmount || 0;
        acc[key].discountPercent += item.discountPercentage || 0;
        acc[key].discountedMembers.add(item.customerEmail);
        acc[key].discountedRevenue += item.paymentValue || 0;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and format data
    return Object.values(monthlyCategoryData).map((item: any) => {
      const avgDiscountPercent = item.discountedTransactions > 0 
        ? item.discountPercent / item.discountedTransactions 
        : 0;

      return {
        ...item,
        discountedMembers: item.discountedMembers.size,
        totalMembers: item.totalMembers.size,
        avgDiscountPercent,
        discountedATV: item.discountedTransactions > 0 ? item.discountedRevenue / item.discountedTransactions : 0,
        totalATV: item.totalTransactions > 0 ? item.totalRevenue / item.totalTransactions : 0,
        discountPenetration: item.totalTransactions > 0 ? (item.discountedTransactions / item.totalTransactions) * 100 : 0,
        revenueImpact: item.totalRevenue - item.discountedRevenue
      };
    }).sort((a, b) => b.discountValue - a.discountValue);
  }, [data]);

  const columns = [
    { 
      key: 'month', 
      header: 'Month', 
      align: 'left' as const,
      render: (value: string) => <span className="font-semibold text-slate-800">{value}</span>
    },
    { 
      key: 'category', 
      header: 'Category', 
      align: 'left' as const,
      render: (value: string) => <span className="font-medium text-slate-700">{value}</span>
    },
    { 
      key: 'discountValue', 
      header: 'Discount Value', 
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold text-red-600">{formatCurrency(value)}</span>
    },
    { 
      key: 'avgDiscountPercent', 
      header: 'Avg Discount %', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="text-red-600 border-red-200">
          {value.toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'discountedTransactions', 
      header: 'Disc. Sales', 
      align: 'center' as const,
      render: (value: number, item: any) => (
        <div className="text-center">
          <div className="font-medium">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">of {formatNumber(item.totalTransactions)}</div>
        </div>
      )
    },
    { 
      key: 'discountPenetration', 
      header: 'Penetration', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="secondary" className="min-w-[60px] justify-center">
          {value.toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'discountedATV', 
      header: 'Disc. ATV', 
      align: 'center' as const,
      render: (value: number, item: any) => (
        <div className="text-center">
          <div className="font-medium text-blue-600">{formatCurrency(value)}</div>
          <div className="text-xs text-slate-500">vs {formatCurrency(item.totalATV)}</div>
        </div>
      )
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Tag className="w-6 h-6 text-blue-600" />
          Category Discount Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModernDataTable
          data={processedData}
          columns={columns}
          maxHeight="500px"
          stickyHeader={true}
          onRowClick={onRowClick}
        />
      </CardContent>
    </Card>
  );
};
