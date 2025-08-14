
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiscountAssociateTableProps {
  data: SalesData[];
  filters?: any;
  onRowClick?: (row: any) => void;
}

export const DiscountAssociateTable: React.FC<DiscountAssociateTableProps> = ({ 
  data, 
  filters, 
  onRowClick 
}) => {
  const processedData = useMemo(() => {
    // Group by month and associate
    const monthlyAssociateData = data.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const associate = item.soldBy || 'Unknown Associate';
      const key = `${monthKey}-${associate}`;
      
      if (!acc[key]) {
        acc[key] = {
          month: monthName,
          associate,
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
    return Object.values(monthlyAssociateData).map((item: any) => {
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
        discountRate: item.totalTransactions > 0 ? (item.discountedTransactions / item.totalTransactions) * 100 : 0,
        avgDiscountPerTransaction: item.discountedTransactions > 0 ? item.discountValue / item.discountedTransactions : 0
      };
    }).sort((a, b) => b.discountValue - a.discountValue);
  }, [data]);

  const totals = useMemo(() => {
    return processedData.reduce((acc, row) => ({
      totalTransactions: acc.totalTransactions + row.totalTransactions,
      discountedTransactions: acc.discountedTransactions + row.discountedTransactions,
      discountValue: acc.discountValue + row.discountValue,
      totalRevenue: acc.totalRevenue + row.totalRevenue,
      discountedRevenue: acc.discountedRevenue + row.discountedRevenue,
      totalMembers: acc.totalMembers + row.totalMembers,
      discountedMembers: acc.discountedMembers + row.discountedMembers
    }), { 
      totalTransactions: 0, discountedTransactions: 0, discountValue: 0, 
      totalRevenue: 0, discountedRevenue: 0, totalMembers: 0, discountedMembers: 0 
    });
  }, [processedData]);

  const columns = [
    { 
      key: 'month', 
      header: 'Month', 
      align: 'left' as const,
      render: (value: string) => <span className="font-semibold text-slate-800">{value}</span>
    },
    { 
      key: 'associate', 
      header: 'Associate', 
      align: 'left' as const,
      render: (value: string) => <span className="font-medium text-slate-700">{value}</span>
    },
    { 
      key: 'discountValue', 
      header: 'Total Discount', 
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold text-red-600">{formatCurrency(value)}</span>
    },
    { 
      key: 'avgDiscountPerTransaction', 
      header: 'Avg Discount', 
      align: 'center' as const,
      render: (value: number) => <span className="font-medium text-slate-700">{formatCurrency(value)}</span>
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
      key: 'discountRate', 
      header: 'Discount Rate', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="text-orange-600 border-orange-200 min-w-[60px] justify-center">
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
    },
    { 
      key: 'discountedAUV', 
      header: 'Disc. AUV', 
      align: 'center' as const,
      render: (value: number, item: any) => (
        <div className="text-center">
          <div className="font-medium text-green-600">{formatCurrency(value)}</div>
          <div className="text-xs text-slate-500">vs {formatCurrency(item.totalAUV)}</div>
        </div>
      )
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          Associate Discount Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModernDataTable
          data={processedData}
          columns={columns}
          showFooter={true}
          footerData={{
            month: 'TOTAL',
            associate: `${new Set(processedData.map(p => p.associate)).size} Associates`,
            discountValue: totals.discountValue,
            avgDiscountPerTransaction: totals.discountedTransactions > 0 ? totals.discountValue / totals.discountedTransactions : 0,
            discountedTransactions: totals.discountedTransactions,
            totalTransactions: totals.totalTransactions,
            discountRate: totals.totalTransactions > 0 ? (totals.discountedTransactions / totals.totalTransactions) * 100 : 0,
            discountedATV: totals.discountedTransactions > 0 ? totals.discountedRevenue / totals.discountedTransactions : 0,
            totalATV: totals.totalTransactions > 0 ? totals.totalRevenue / totals.totalTransactions : 0,
            discountedAUV: totals.discountedMembers > 0 ? totals.discountedRevenue / totals.discountedMembers : 0,
            totalAUV: totals.totalMembers > 0 ? totals.totalRevenue / totals.totalMembers : 0
          }}
          maxHeight="500px"
          stickyHeader={true}
          onRowClick={onRowClick}
        />
      </CardContent>
    </Card>
  );
};
