
import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheets } from './useGoogleSheets';

export interface DiscountAnalysisData {
  memberId: string;
  customerName: string;
  customerEmail: string;
  paymentDate: string;
  paymentValue: number;
  paymentItem: string;
  paymentMethod: string;
  soldBy: string;
  location: string;
  cleanedProduct: string;
  cleanedCategory: string;
  mrpPreTax: number;
  mrpPostTax: number;
  discountAmount: number;
  discountPercentage: number;
  membershipType: string;
}

export const useDiscountAnalysis = () => {
  const { data: salesData, loading, error } = useGoogleSheets();
  const [discountData, setDiscountData] = useState<DiscountAnalysisData[]>([]);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      try {
        console.log('Processing discount analysis data...', salesData.length, 'items');
        
        const parseNumber = (value: any): number => {
          if (value === null || value === undefined || value === '') return 0;
          // Handle string values with currency symbols or commas
          const cleanValue = value.toString().replace(/[₹,\s]/g, '');
          const num = parseFloat(cleanValue);
          return isNaN(num) ? 0 : num;
        };

        const parseDate = (dateStr: string) => {
          if (!dateStr) return '';
          try {
            // Split date and time if present
            const [datePart] = dateStr.split(' ');
            const [day, month, year] = datePart.split('/');
            // Create ISO date string for proper parsing
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            return new Date(isoDate).toISOString().split('T')[0];
          } catch (e) {
            console.error('Date parsing error:', e);
            return '';
          }
        };

        const processedData: DiscountAnalysisData[] = salesData.map((item: any) => {
          const discountAmount = parseNumber(item['Discount Amount -Mrp- Payment Value']);
          const discountPercentage = parseNumber(item['Discount Percentage - discount amount/mrp*100']);
          
          return {
            memberId: item['Member ID']?.toString() || '',
            customerName: item['Customer Name'] || '',
            customerEmail: item['Customer Email'] || '',
            paymentDate: parseDate(item['Payment Date'] || ''),
            paymentValue: parseNumber(item['Payment Value']),
            paymentItem: item['Payment Item'] || '',
            paymentMethod: item['Payment Method'] || '',
            soldBy: item['Sold By'] === '-' ? 'Online/System' : (item['Sold By'] || 'Unknown'),
            location: item['Calculated Location'] || '',
            cleanedProduct: item['Cleaned Product'] || '',
            cleanedCategory: item['Cleaned Category'] || '',
            mrpPreTax: parseNumber(item['Mrp - Pre Tax']),
            mrpPostTax: parseNumber(item['Mrp - Post Tax']),
            discountAmount,
            discountPercentage,
            membershipType: item['Membership Type'] || '',
          };
        });

        // Filter for transactions with actual discounts - check both amount and percentage
        const discountedTransactions = processedData.filter(item => {
          const hasDiscountAmount = item.discountAmount && item.discountAmount > 0;
          const hasDiscountPercentage = item.discountPercentage && item.discountPercentage > 0;
          return hasDiscountAmount || hasDiscountPercentage;
        });

        console.log('Discount Analysis - Total transactions:', processedData.length);
        console.log('Discount Analysis - Discounted transactions:', discountedTransactions.length);
        
        if (discountedTransactions.length > 0) {
          console.log('Sample discount transaction:', discountedTransactions[0]);
        }

        setDiscountData(discountedTransactions);
      } catch (error) {
        console.error('Error processing discount data:', error);
        setDiscountData([]);
      }
    } else {
      console.log('No sales data available for discount analysis');
      setDiscountData([]);
    }
  }, [salesData]);

  // Calculate discount metrics
  const metrics = useMemo(() => {
    if (!discountData.length) {
      console.log('No discount data available for metrics calculation');
      return {
        totalDiscountAmount: 0,
        totalRevenueLost: 0,
        totalTransactions: 0,
        avgDiscountPercentage: 0,
        totalPotentialRevenue: 0,
        totalActualRevenue: 0,
        discountEffectiveness: 0,
        productBreakdown: [],
        monthlyBreakdown: [],
      };
    }

    const totalDiscountAmount = discountData.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalRevenueLost = discountData.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalTransactions = discountData.length;
    const avgDiscountPercentage = discountData.reduce((sum, item) => sum + item.discountPercentage, 0) / totalTransactions;
    const totalPotentialRevenue = discountData.reduce((sum, item) => sum + item.mrpPreTax, 0);
    const totalActualRevenue = discountData.reduce((sum, item) => sum + item.paymentValue, 0);

    // Group by product
    const productBreakdown = discountData.reduce((acc, item) => {
      const key = item.cleanedProduct || 'Unknown Product';
      if (!acc[key]) {
        acc[key] = {
          product: key,
          transactions: 0,
          totalDiscount: 0,
          avgDiscountPercentage: 0,
          revenue: 0,
        };
      }
      acc[key].transactions += 1;
      acc[key].totalDiscount += item.discountAmount;
      acc[key].revenue += item.paymentValue;
      return acc;
    }, {} as Record<string, any>);

    // Calculate average discount percentage for each product
    Object.values(productBreakdown).forEach((product: any) => {
      const productTransactions = discountData.filter(item => item.cleanedProduct === product.product);
      product.avgDiscountPercentage = productTransactions.reduce((sum, item) => sum + item.discountPercentage, 0) / productTransactions.length;
    });

    // Group by month
    const monthlyBreakdown = discountData.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          transactions: 0,
          totalDiscount: 0,
          revenue: 0,
        };
      }
      acc[monthKey].transactions += 1;
      acc[monthKey].totalDiscount += item.discountAmount;
      acc[monthKey].revenue += item.paymentValue;
      return acc;
    }, {} as Record<string, any>);

    const calculatedMetrics = {
      totalDiscountAmount,
      totalRevenueLost,
      totalTransactions,
      avgDiscountPercentage,
      totalPotentialRevenue,
      totalActualRevenue,
      discountEffectiveness: totalPotentialRevenue > 0 ? (totalActualRevenue / totalPotentialRevenue) * 100 : 0,
      productBreakdown: Object.values(productBreakdown),
      monthlyBreakdown: Object.values(monthlyBreakdown),
    };

    console.log('Discount Metrics:', calculatedMetrics);
    return calculatedMetrics;
  }, [discountData]);

  return {
    data: discountData,
    metrics,
    loading,
    error,
  };
};
