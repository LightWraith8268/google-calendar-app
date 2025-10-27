import { useState, useEffect } from 'react';
import { getGoogleEvents } from '../lib/calendar-api';
import { GoogleEvent } from '../types';

export function useCalendarEvents(calendarId: string | null, timeMin?: string, timeMax?: string) {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!calendarId) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGoogleEvents(calendarId, timeMin, timeMax);
        setEvents(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [calendarId, timeMin, timeMax]);

  return { events, loading, error };
}
