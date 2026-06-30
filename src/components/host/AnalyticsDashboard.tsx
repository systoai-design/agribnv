import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, eachDayOfInterval, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Property, Booking } from '@/types/database';

interface AnalyticsDashboardProps {
  properties: Property[];
  bookings: Booking[];
}

function getMonthLabel(monthsAgo: number): string {
  return format(subMonths(new Date(), monthsAgo), 'MMM');
}

export function AnalyticsDashboard({ properties, bookings }: AnalyticsDashboardProps) {
  const monthlyRevenue = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const monthsAgo = 5 - i;
      const start = startOfMonth(subMonths(new Date(), monthsAgo));
      const end = endOfMonth(start);
      const revenue = bookings
        .filter((b) => {
          const d = parseISO(b.check_in);
          return (b.status === 'confirmed' || b.status === 'completed') && d >= start && d <= end;
        })
        .reduce((sum, b) => sum + Number(b.total_price), 0);
      return { month: getMonthLabel(monthsAgo), revenue };
    });
  }, [bookings]);

  const monthlyVolume = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const monthsAgo = 5 - i;
      const start = startOfMonth(subMonths(new Date(), monthsAgo));
      const end = endOfMonth(start);
      const inRange = (b: Booking) => { const d = parseISO(b.check_in); return d >= start && d <= end; };
      return {
        month: getMonthLabel(monthsAgo),
        confirmed: bookings.filter((b) => b.status === 'confirmed' && inRange(b)).length,
        completed: bookings.filter((b) => b.status === 'completed' && inRange(b)).length,
        cancelled: bookings.filter((b) => b.status === 'cancelled' && inRange(b)).length,
        pending: bookings.filter((b) => b.status === 'pending' && inRange(b)).length,
      };
    });
  }, [bookings]);

  const occupancy = useMemo(() => {
    const rangeStart = subMonths(new Date(), 1);
    const rangeEnd = new Date();
    const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;

    return properties.map((p) => {
      const confirmedBookings = bookings.filter(
        (b) =>
          b.property_id === p.id &&
          (b.status === 'confirmed' || b.status === 'completed')
      );

      const occupiedDays = new Set<string>();
      confirmedBookings.forEach((b) => {
        const start = parseISO(b.check_in) < rangeStart ? rangeStart : parseISO(b.check_in);
        const end = parseISO(b.check_out) > rangeEnd ? rangeEnd : parseISO(b.check_out);
        if (start <= end) {
          eachDayOfInterval({ start, end }).forEach((d) =>
            occupiedDays.add(format(d, 'yyyy-MM-dd'))
          );
        }
      });

      const rate = Math.round((occupiedDays.size / totalDays) * 100);
      return { name: p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name, rate };
    });
  }, [properties, bookings]);

  const hasData = bookings.length > 0;

  if (!hasData) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <div className="text-5xl mb-4">📊</div>
          <h3 className="font-semibold text-lg mb-2">No data yet</h3>
          <p className="text-muted-foreground text-sm">Analytics will appear once you receive bookings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Monthly Revenue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Revenue (₱)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {monthlyRevenue.map((_, i) => (
                  <Cell key={i} fill={i === monthlyRevenue.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.45)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Booking Volume */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Booking Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyVolume} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill="hsl(var(--success) / 0.85)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(var(--warning) / 0.7)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="hsl(var(--destructive) / 0.5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
            {[
              { label: 'Confirmed', color: 'hsl(var(--success))' },
              { label: 'Completed', color: 'hsl(var(--primary))' },
              { label: 'Pending', color: 'hsl(var(--warning))' },
              { label: 'Cancelled', color: 'hsl(var(--destructive))' },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Occupancy */}
      {properties.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">30-Day Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {occupancy.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-muted-foreground truncate max-w-[70%]">{item.name}</span>
                    <span className="font-semibold text-foreground">{item.rate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.rate}%`,
                        backgroundColor: item.rate >= 70 ? 'hsl(var(--primary))' : item.rate >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground) / 0.5)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
