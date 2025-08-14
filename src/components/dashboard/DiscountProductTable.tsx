
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiscountProductTableProps {
  data: SalesData[];
  filters?: any;
  onRowClick?: (row: any) => void;
}

export const DiscountProductTable: React.FC<DiscountProductTableProps> = ({ 
  data, 
  filters, 
  onRowClick 
}) => {
  const processedData = useMemo(() => {
    // Group by month and product
    const monthlyProductData = data.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const product = item.cleanedProduct || 'Unknown Product';
      const key = `${monthKey}-${product}`;
      
      if (!acc[key]) {
        acc[key] = {
          month: monthName,
          product,
          discountedTransactions: 0,
          totalTransactions: 0,
          discountValue: 0,
          discountPercent: 0,
          discountedUnits: 0,
          totalUnits: 0,
          discountedMembers: new Set(),
          totalMembers: new Set(),
          discountedRevenue: 0,
          totalRevenue: 0,
          discountedATV: 0,
          totalATV: 0,
          discountedAUV: 0,
          totalAUV: 0,
          discountedASV: 0,
          totalASV: 0
        };
      }

      // All transactions
      acc[key].totalTransactions += 1;
      acc[key].totalUnits += 1;
      acc[key].totalMembers.add(item.customerEmail);
      acc[key].totalRevenue += item.paymentValue || 0;

      // Discounted transactions
      if ((item.discountAmount || 0) > 0) {
        acc[key].discountedTransactions += 1;
        acc[key].discountValue += item.discountAmount || 0;
        acc[key].discountPercent += item.discountPercentage || 0;
        acc[key].discountedUnits += 1;
        acc[key].discountedMembers.add(item.customerEmail);
        acc[key].discountedRevenue += item.paymentValue || 0;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and format data
    return Object.values(monthlyProductData).map((item: any) => {
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
        discountedAUV: item.discountedMembers.size > 0 ? item.discountedRevenue / item.discountedMembers.size : 0,
        totalAUV: item.totalMembers.size > 0 ? item.totalRevenue / item.totalMembers.size : 0,
        discountedASV: item.discountedMembers.size > 0 ? item.discountedRevenue / item.discountedMembers.size : 0,
        totalASV: item.totalMembers.size > 0 ? item.totalRevenue / item.totalMembers.size : 0,
        discountPenetration: item.totalTransactions > 0 ? (item.discountedTransactions / item.totalTransactions) * 100 : 0
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
      key: 'product', 
      header: 'Product', 
      align: 'left' as const,
      render: (value: string) => <span className="font-medium text-slate-700 truncate">{value}</span>
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
      header: 'Disc. Transactions', 
      align: 'center' as const,
      render: (value: number, item: any) => (
        <div className="text-center">
          <div className="font-medium">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">of {formatNumber(item.totalTransactions)}</div>
        </div>
      )
    },
    { 
      key: 'discountedMembers', 
      header: 'Disc. Members', 
      align: 'center' as const,
      render: (value: number, item: any) => (
        <div className="text-center">
          <div className="font-medium">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">of {formatNumber(item.totalMembers)}</div>
        </div>
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
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="w-6 h-6 text-red-600" />
          Product Discount Analysis
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
