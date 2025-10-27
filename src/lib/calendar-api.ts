import { supabase } from './supabase';
import { GoogleEvent } from '../types';

const API_BASE = import.meta.env.VITE_SUPABASE_URL;

async function getAuthToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.access_token;
}

export async function getGoogleEvents(
  calendarId: string,
  timeMin?: string,
  timeMax?: string
) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const params = new URLSearchParams({
    calendarId,
    ...(timeMin && { timeMin }),
    ...(timeMax && { timeMax }),
  });

  const response = await fetch(
    `${API_BASE}/functions/v1/get-google-events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  return response.json();
}

export async function createGoogleEvent(
  calendarId: string,
  event: Partial<GoogleEvent>
) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    `${API_BASE}/functions/v1/google-event-upsert`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendarId,
        event,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`);
  }

  return response.json();
}

export async function updateGoogleEvent(
  calendarId: string,
  eventId: string,
  event: Partial<GoogleEvent>
) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    `${API_BASE}/functions/v1/google-event-upsert`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendarId,
        event,
        eventId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteGoogleEvent(
  calendarId: string,
  eventId: string
) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    `${API_BASE}/functions/v1/google-event-delete`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendarId,
        eventId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`);
  }
}

export async function getGoogleCalendars() {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const { data: calendars, error } = await supabase
    .from('google_calendars')
    .select('*')
    .order('is_primary', { ascending: false });

  if (error) throw error;
  return calendars;
}