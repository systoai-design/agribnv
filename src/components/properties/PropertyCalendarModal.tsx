import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DateRange } from 'react-day-picker';

export interface FarmEvent {
  date: Date;
  title: string;
  description: string;
  image: string;
}

interface PropertyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  disabledDates: Date[];
  specialEvents: FarmEvent[];
  locationName: string;
}

export function PropertyCalendarModal({
  isOpen,
  onClose,
  dateRange,
  setDateRange,
  disabledDates,
  specialEvents,
  locationName,
}: PropertyCalendarModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedEvent, setSelectedEvent] = useState<FarmEvent | null>(null);

  const eventDates = specialEvents.map(event => event.date);

  const handleDayClick = (day: Date) => {
    const event = specialEvents.find(e => isSameDay(e.date, day));
    if (event) {
      setSelectedEvent(event);
    } else {
      setSelectedEvent(null);
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#B0D182] overflow-hidden relative">
      {/* Header matching screenshot */}
      <div className="p-6 pt-10 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full -ml-2 text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-primary">Select Dates</h2>
        <button onClick={() => { setDateRange(undefined); setSelectedEvent(null); }} className="text-sm text-primary font-medium hover:underline">
          Cancel
        </button>
      </div>
      
      {/* Main Content Area in White Card */}
      <div className="flex-1 bg-[#FEF9F0] rounded-t-[2.5rem] overflow-y-auto w-full pb-32 relative z-10 shadow-t-xl px-6 pt-8">
        
        <div className="flex items-center gap-2 text-primary font-semibold mb-6 px-2">
          <div className="h-5 w-5 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-lg">{locationName}</span>
        </div>

        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2 px-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#B0D182]"></span> 
          Highlighted days have special farm events!
        </p>

        <div className="flex justify-center mb-6">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => setDateRange(range)}
            onDayClick={handleDayClick}
            disabled={disabledDates}
            numberOfMonths={isDesktop ? 2 : 1}
            modifiers={{ event: eventDates }}
            modifiersStyles={{
              event: { backgroundColor: '#B0D182', fontWeight: 'bold', color: 'hsl(var(--primary))', borderRadius: '9999px' }
            }}
            className="pointer-events-auto bg-transparent border-0 font-serif"
          />
        </div>

        {/* Event Preview Card */}
        {selectedEvent && (
          <div className="mb-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-primary">
              <CalendarIcon className="h-5 w-5" />
              Event: {format(selectedEvent.date, 'MMM d, yyyy')}
            </h3>
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-border/50">
              <div className="h-48 w-full relative">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <h4 className="absolute bottom-4 left-5 text-white font-bold text-xl leading-tight pr-4">{selectedEvent.title}</h4>
              </div>
              <div className="p-5">
                <p className="text-muted-foreground leading-relaxed text-[15px]">{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white z-20 flex flex-col items-center shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl">
        <div className="flex justify-between w-full mb-6 px-4">
          <div className="flex flex-col items-start">
            <span className="text-xs text-muted-foreground font-medium mb-1">Check In</span>
            <span className="font-bold text-lg text-primary">
              {dateRange?.from ? format(dateRange.from, 'd MMM, EEE') : '--'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground font-medium mb-1">Check Out</span>
            <span className="font-bold text-lg text-primary">
              {dateRange?.to ? format(dateRange.to, 'd MMM, EEE') : '--'}
            </span>
          </div>
        </div>
        <Button 
          className="w-full rounded-full h-14 bg-[#156530] hover:bg-[#156530]/90 text-white font-bold text-lg"
          onClick={onClose}
        >
          Confirm
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-0 h-[85vh] [&>button]:hidden bg-[#B0D182]">
          <DialogHeader className="sr-only">
            <DialogTitle>Select Dates</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[95vh] p-0 border-t-0 rounded-t-[2.5rem] overflow-hidden gap-0 [&>button]:hidden bg-[#B0D182]">
        <SheetHeader className="sr-only">
          <SheetTitle>Select Dates</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
