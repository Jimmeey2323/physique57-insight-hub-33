
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiscountYearComparisonTableProps {
  data: SalesData[];
  filters?: any;
  onRowClick?: (row: any) => void;
}

export const DiscountYearComparisonTable: React.FC<DiscountYearComparisonTableProps> = ({ 
  data, 
  filters, 
  onRowClick 
}) => {
  const processedData = useMemo(() => {
    // Group by year and month
    const yearMonthData = data.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const key = `${monthName}`;
      
      if (!acc[key]) {
        acc[key] = { month: monthName, years: {} };
      }
      
      if (!acc[key].years[year]) {
        acc[key].years[year] = {
          transactions: 0,
          discountedTransactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          discountedRevenue: 0,
          uniqueMembers: new Set(),
          discountedMembers: new Set(),
          discountPercentages: []
        };
      }

      acc[key].years[year].transactions += 1;
      acc[key].years[year].totalRevenue += item.paymentValue || 0;
      acc[key].years[year].uniqueMembers.add(item.customerEmail);

      if ((item.discountAmount || 0) > 0) {
        acc[key].years[year].discountedTransactions += 1;
        acc[key].years[year].totalDiscount += item.discountAmount || 0;
        acc[key].years[year].discountedRevenue += item.paymentValue || 0;
        acc[key].years[year].discountedMembers.add(item.customerEmail);
        acc[key].years[year].discountPercentages.push(item.discountPercentage || 0);
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert to table format
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return months.map(month => {
      const monthData = yearMonthData[month];
      if (!monthData) {
        return {
          month,
          discount2024: 0,
          discount2025: 0,
          transactions2024: 0,
          transactions2025: 0,
          discountedTransactions2024: 0,
          discountedTransactions2025: 0,
          revenue2024: 0,
          revenue2025: 0,
          members2024: 0,
          members2025: 0,
          discountChange: 0,
          transactionChange: 0,
          revenueChange: 0
        };
      }

      const data2024 = monthData.years[2024] || { 
        transactions: 0, discountedTransactions: 0, totalDiscount: 0, 
        totalRevenue: 0, uniqueMembers: new Set(), discountedMembers: new Set() 
      };
      const data2025 = monthData.years[2025] || { 
        transactions: 0, discountedTransactions: 0, totalDiscount: 0, 
        totalRevenue: 0, uniqueMembers: new Set(), discountedMembers: new Set() 
      };

      return {
        month,
        discount2024: data2024.totalDiscount,
        discount2025: data2025.totalDiscount,
        transactions2024: data2024.transactions,
        transactions2025: data2025.transactions,
        discountedTransactions2024: data2024.discountedTransactions,
        discountedTransactions2025: data2025.discountedTransactions,
        revenue2024: data2024.totalRevenue,
        revenue2025: data2025.totalRevenue,
        members2024: data2024.uniqueMembers.size,
        members2025: data2025.uniqueMembers.size,
        atv2024: data2024.transactions > 0 ? data2024.totalRevenue / data2024.transactions : 0,
        atv2025: data2025.transactions > 0 ? data2025.totalRevenue / data2025.transactions : 0,
        discountChange: data2024.totalDiscount > 0 ? ((data2025.totalDiscount - data2024.totalDiscount) / data2024.totalDiscount) * 100 : 0,
        transactionChange: data2024.transactions > 0 ? ((data2025.transactions - data2024.transactions) / data2024.transactions) * 100 : 0,
        revenueChange: data2024.totalRevenue > 0 ? ((data2025.totalRevenue - data2024.totalRevenue) / data2024.totalRevenue) * 100 : 0,
        discountRate2024: data2024.transactions > 0 ? (data2024.discountedTransactions / data2024.transactions) * 100 : 0,
        discountRate2025: data2025.transactions > 0 ? (data2025.discountedTransactions / data2025.transactions) * 100 : 0
      };
    });
  }, [data]);

  const totals = useMemo(() => {
    return processedData.reduce((acc, row) => ({
      discount2024: acc.discount2024 + row.discount2024,
      discount2025: acc.discount2025 + row.discount2025,
      transactions2024: acc.transactions2024 + row.transactions2024,
      transactions2025: acc.transactions2025 + row.transactions2025,
      revenue2024: acc.revenue2024 + row.revenue2024,
      revenue2025: acc.revenue2025 + row.revenue2025,
      members2024: acc.members2024 + row.members2024,
      members2025: acc.members2025 + row.members2025
    }), { 
      discount2024: 0, discount2025: 0, 
      transactions2024: 0, transactions2025: 0, 
      revenue2024: 0, revenue2025: 0,
      members2024: 0, members2025: 0
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
      key: 'discount2024', 
      header: '2024 Discount', 
      align: 'center' as const,
      render: (value: number) => <span className="font-medium text-red-600">{formatCurrency(value)}</span>
    },
    { 
      key: 'discount2025', 
      header: '2025 Discount', 
      align: 'center' as const,
      render: (value: number) => <span className="font-medium text-red-600">{formatCurrency(value)}</span>
    },
    { 
      key: 'discountChange', 
      header: 'Discount Change', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value <= 0 ? "default" : "destructive"} className="min-w-[70px] justify-center">
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'transactions2024', 
      header: '2024 Sales', 
      align: 'center' as const,
      render: (value: number) => <span className="font-medium">{formatNumber(value)}</span>
    },
    { 
      key: 'transactions2025', 
      header: '2025 Sales', 
      align: 'center' as const,
      render: (value: number) => <span className="font-medium">{formatNumber(value)}</span>
    },
    { 
      key: 'transactionChange', 
      header: 'Sales Change', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value >= 0 ? "default" : "destructive"} className="min-w-[70px] justify-center">
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'atv2024', 
      header: '2024 ATV', 
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-medium">{formatCurrency(value)}</span>
    },
    { 
      key: 'atv2025', 
      header: '2025 ATV', 
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-medium">{formatCurrency(value)}</span>
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-green-600" />
          Year-on-Year Discount Comparison (2024 vs 2025)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModernDataTable
          data={processedData}
          columns={columns}
          showFooter={true}
          footerData={{
            month: 'TOTAL',
            discount2024: totals.discount2024,
            discount2025: totals.discount2025,
            transactions2024: totals.transactions2024,
            transactions2025: totals.transactions2025,
            revenue2024: totals.revenue2024,
            revenue2025: totals.revenue2025,
            discountChange: totals.discount2024 > 0 ? ((totals.discount2025 - totals.discount2024) / totals.discount2024) * 100 : 0,
            transactionChange: totals.transactions2024 > 0 ? ((totals.transactions2025 - totals.transactions2024) / totals.transactions2024) * 100 : 0,
            revenueChange: totals.revenue2024 > 0 ? ((totals.revenue2025 - totals.revenue2024) / totals.revenue2024) * 100 : 0,
            atv2024: totals.transactions2024 > 0 ? totals.revenue2024 / totals.transactions2024 : 0,
            atv2025: totals.transactions2025 > 0 ? totals.revenue2025 / totals.transactions2025 : 0
          }}
          maxHeight="500px"
          stickyHeader={true}
          onRowClick={onRowClick}
        />
        
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Year-on-Year Impact Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Total Discount Change:</span>
              <div className={`font-semibold ${totals.discount2024 > 0 ? 
                ((totals.discount2025 - totals.discount2024) / totals.discount2024) * 100 > 0 ? 'text-red-600' : 'text-green-600'
                : 'text-slate-600'}`}>
                {formatCurrency(totals.discount2025 - totals.discount2024)}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Revenue Impact:</span>
              <div className="font-semibold">{formatCurrency(totals.revenue2025 - totals.revenue2024)}</div>
            </div>
            <div>
              <span className="text-slate-600">Transaction Growth:</span>
              <div className={`font-semibold ${(totals.transactions2025 - totals.transactions2024) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatNumber(totals.transactions2025 - totals.transactions2024)}
              </div>
            </div>
            <div>
              <span className="text-slate-600">ATV Change:</span>
              <div className="font-semibold">
                {formatCurrency(
                  (totals.transactions2025 > 0 ? totals.revenue2025 / totals.transactions2025 : 0) -
                  (totals.transactions2024 > 0 ? totals.revenue2024 / totals.transactions2024 : 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
