import React, { useState, useEffect } from 'react';
import { GoogleEvent } from '../types';
import './EventForm.css';

interface EventFormProps {
  event?: GoogleEvent | null;
  date?: Date;
  onSave: (event: Partial<GoogleEvent>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function EventForm({
  event,
  date,
  onSave,
  onCancel,
  loading = false,
}: EventFormProps) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);

  useEffect(() => {
    if (event) {
      setSummary(event.summary || '');
      setDescription(event.description || '');
      setLocation(event.location || '');

      const isAllDay = !event.start?.dateTime;
      setIsAllDay(isAllDay);

      if (event.start?.dateTime) {
        const startDate = new Date(event.start.dateTime);
        setStartTime(startDate.toISOString().slice(0, 16));
      } else if (event.start?.date) {
        setStartTime(event.start.date);
      }

      if (event.end?.dateTime) {
        const endDate = new Date(event.end.dateTime);
        setEndTime(endDate.toISOString().slice(0, 16));
      } else if (event.end?.date) {
        setEndTime(event.end.date);
      }
    } else if (date) {
      const dateStr = date.toISOString().slice(0, 10);
      setStartTime(dateStr);
      setEndTime(dateStr);
      setIsAllDay(true);
    }
  }, [event, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eventData: Partial<GoogleEvent> = {
      summary,
      description,
      location,
    };

    if (isAllDay) {
      eventData.start = { date: startTime.split('T')[0] };
      eventData.end = { date: endTime.split('T')[0] };
    } else {
      eventData.start = { dateTime: startTime };
      eventData.end = { dateTime: endTime };
    }

    try {
      await onSave(eventData);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <h3>{event ? 'Edit Event' : 'Create Event'}</h3>

      <div className="form-group">
        <label htmlFor="summary">Event Title *</label>
        <input
          id="summary"
          type="text"
          required
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Event title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description (optional)"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Event location (optional)"
        />
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
          />
          All-day event
        </label>
      </div>

      {!isAllDay && (
        <>
          <div className="form-group">
            <label htmlFor="startTime">Start Time *</label>
            <input
              id="startTime"
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <input
              id="endTime"
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </>
      )}

      {isAllDay && (
        <>
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              id="startDate"
              type="date"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              id="endDate"
              type="date"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Event'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}