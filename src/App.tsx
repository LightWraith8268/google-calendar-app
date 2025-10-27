import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getGoogleCalendars, createGoogleEvent, updateGoogleEvent, deleteGoogleEvent } from './lib/calendar-api';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { Calendar } from './types';
import { GoogleEvent } from './types';
import { CalendarGrid } from './components/CalendarGrid';
import { EventForm } from './components/EventForm';
import { EventDetail } from './components/EventDetail';
import './App.css';

type View = 'calendar' | 'event-form' | 'event-detail';

function App() {
  const [session, setSession] = useState<any>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<GoogleEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get events for the current month
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const { events } = useCalendarEvents(
    selectedCalendarId,
    monthStart.toISOString(),
    monthEnd.toISOString()
  );

  // Setup auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Load calendars when user is authenticated
  useEffect(() => {
    if (!session) return;

    const loadCalendars = async () => {
      try {
        const cals = await getGoogleCalendars();
        setCalendars(cals);
        if (cals.length > 0) {
          setSelectedCalendarId(cals[0].calendar_id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calendars');
      }
    };

    loadCalendars();
  }, [session]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/google-calendar-app/callback`,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setCalendars([]);
      setSelectedCalendarId(null);
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  const handleCreateEvent = async (eventData: Partial<GoogleEvent>) => {
    if (!selectedCalendarId) return;

    try {
      setLoading(true);
      await createGoogleEvent(selectedCalendarId, eventData);
      setCurrentView('calendar');
      // Refresh events
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (eventData: Partial<GoogleEvent>) => {
    if (!selectedCalendarId || !selectedEvent) return;

    try {
      setLoading(true);
      await updateGoogleEvent(selectedCalendarId, selectedEvent.id, eventData);
      setCurrentView('calendar');
      setSelectedEvent(null);
      // Refresh events
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedCalendarId || !selectedEvent) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      setLoading(true);
      await deleteGoogleEvent(selectedCalendarId, selectedEvent.id);
      setCurrentView('calendar');
      setSelectedEvent(null);
      // Refresh events
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Google Calendar App</h1>
          <p>Sign in with your Google account to manage your calendars</p>
          <button
            className="btn-google"
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Google Calendar</h1>
        <div className="header-actions">
          {calendars.length > 0 && (
            <select
              value={selectedCalendarId || ''}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
            >
              {calendars.map((cal) => (
                <option key={cal.calendar_id} value={cal.calendar_id}>
                  {cal.calendar_name}
                </option>
              ))}
            </select>
          )}
          <button
            className="btn-new-event"
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDate(new Date());
              setCurrentView('event-form');
            }}
          >
            + New Event
          </button>
          <button className="btn-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button
            className="btn-close"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      <main className="app-main">
        {currentView === 'calendar' && (
          <>
            <div className="calendar-controls">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                  )
                }
              >
                ← Previous
              </button>
              <span>
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                  )
                }
              >
                Next →
              </button>
            </div>
            <CalendarGrid
              date={currentDate}
              events={events}
              onDateClick={(date) => {
                setSelectedDate(date);
                setSelectedEvent(null);
                setCurrentView('event-form');
              }}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setCurrentView('event-detail');
              }}
            />
          </>
        )}

        {currentView === 'event-form' && (
          <EventForm
            event={selectedEvent}
            date={selectedDate || undefined}
            onSave={selectedEvent ? handleUpdateEvent : handleCreateEvent}
            onCancel={() => {
              setCurrentView('calendar');
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
            loading={loading}
          />
        )}

        {currentView === 'event-detail' && selectedEvent && (
          <EventDetail
            event={selectedEvent}
            onEdit={() => setCurrentView('event-form')}
            onDelete={handleDeleteEvent}
            onClose={() => {
              setCurrentView('calendar');
              setSelectedEvent(null);
            }}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}

export default App;