
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionLocationSelectorProps {
  data: NewClientData[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export const ClientConversionLocationSelector: React.FC<ClientConversionLocationSelectorProps> = ({
  data,
  selectedLocation,
  onLocationChange
}) => {
  // Get unique locations from data and map them to correct names
  const uniqueLocations = [...new Set(data.map(item => item.firstVisitLocation || item.homeLocation).filter(Boolean))];
  
  // Map locations to correct display names
  const locationMapping: Record<string, string> = {
    'Bandra West': 'Supreme HQ, Bandra',
    'Bengaluru': 'Kenkere House, Bengaluru',
    'Kwality House, Kemps Corner': 'Kwality House, Kemps Corner',
    'Juhu': 'Juhu'
  };

  const mappedLocations = uniqueLocations.map(location => 
    locationMapping[location] || location
  );

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-purple-600" />
          <label className="text-sm font-medium text-gray-700">Filter by Location:</label>
          <Select
            value={selectedLocation}
            onValueChange={onLocationChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select location..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {mappedLocations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
