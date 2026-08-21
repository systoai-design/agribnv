import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types/database';
import { Loader2, CalendarX, Lock, Unlock } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface HostCalendarManagerProps {
  propertyId: string;
}

export function HostCalendarManager({ propertyId }: HostCalendarManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocking, setIsBlocking] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedBlockedBooking, setSelectedBlockedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [propertyId]);

  const fetchBookings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      toast({ title: 'Error loading calendar', description: error.message, variant: 'destructive' });
    } else {
      setBookings(data as unknown as Booking[]);
    }
    setIsLoading(false);
  };

  const disabledDates = bookings.flatMap((booking) => {
    const start = new Date(booking.check_in);
    const end = new Date(booking.check_out);
    end.setDate(end.getDate() - 1);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];
    
    return eachDayOfInterval({ start, end });
  });

  const guestBookings = bookings.filter(b => b.special_requests !== 'HOST_BLOCKED');
  const blockedDatesBookings = bookings.filter(b => b.special_requests === 'HOST_BLOCKED');

  const handleBlockDates = async () => {
    if (!user || !dateRange?.from || !dateRange?.to) return;
    
    setIsBlocking(true);
    
    const { error } = await supabase
      .from('bookings')
      .insert({
        property_id: propertyId,
        guest_id: user.id,
        check_in: format(dateRange.from, 'yyyy-MM-dd'),
        check_out: format(dateRange.to, 'yyyy-MM-dd'),
        total_price: 0,
        guests_count: 1,
        status: 'confirmed',
        special_requests: 'HOST_BLOCKED'
      });

    if (error) {
      toast({ title: 'Failed to block dates', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Dates blocked successfully' });
      setDateRange(undefined);
      fetchBookings();
    }
    
    setIsBlocking(false);
  };

  const handleUnblockDates = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      toast({ title: 'Failed to unblock', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Dates unblocked' });
      setSelectedBlockedBooking(null);
      fetchBookings();
    }
  };

  const handleDayClick = (day: Date) => {
    const blockedBooking = blockedDatesBookings.find(b => {
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);
      return day >= start && day < end;
    });

    if (blockedBooking) {
      setSelectedBlockedBooking(blockedBooking);
      setDateRange(undefined);
    } else {
      setSelectedBlockedBooking(null);
    }
  };

  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-7 lg:col-span-8 flex flex-col items-center">
        <div className="bg-white p-4 rounded-xl shadow-sm border overflow-x-auto max-w-full">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              setSelectedBlockedBooking(null);
            }}
            onDayClick={handleDayClick}
            disabled={disabledDates}
            numberOfMonths={isDesktop ? 2 : 1}
            className="pointer-events-auto"
            modifiers={{
              blocked: disabledDates,
            }}
            modifiersStyles={{
              blocked: { textDecoration: 'line-through', opacity: 0.5 }
            }}
          />
        </div>
        
        <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            Booked / Blocked
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            Selected
          </div>
        </div>
      </div>

      <div className="md:col-span-5 lg:col-span-4 space-y-4">
        {selectedBlockedBooking ? (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Blocked Dates
              </CardTitle>
              <CardDescription>
                {format(new Date(selectedBlockedBooking.check_in), 'MMM d, yyyy')} - {format(new Date(selectedBlockedBooking.check_out), 'MMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">You manually blocked these dates. Guests cannot book them.</p>
              <Button 
                variant="outline" 
                className="w-full text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => handleUnblockDates(selectedBlockedBooking.id)}
              >
                <Unlock className="mr-2 h-4 w-4" />
                Unblock Dates
              </Button>
            </CardContent>
          </Card>
        ) : dateRange?.from && dateRange?.to ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarX className="h-5 w-5" />
                Block Selected Dates
              </CardTitle>
              <CardDescription>
                {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Blocking these dates will prevent guests from booking them. Useful for personal time or property maintenance.
              </p>
              <Button 
                onClick={handleBlockDates} 
                className="w-full"
                disabled={isBlocking}
              >
                {isBlocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Block Dates
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Manage Availability</CardTitle>
              <CardDescription>
                Select available dates on the calendar to block them, or click on an already blocked date to unblock it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-muted-foreground">
                <p><strong>Note:</strong> Guest bookings are automatically blocked out. You only need to manually block dates if you are taking the property offline temporarily.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
