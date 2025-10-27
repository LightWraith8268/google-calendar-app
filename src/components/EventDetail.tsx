import React from 'react';
import { GoogleEvent } from '../types';
import './EventDetail.css';

interface EventDetailProps {
  event: GoogleEvent;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function EventDetail({
  event,
  onEdit,
  onDelete,
  onClose,
  loading = false,
}: EventDetailProps) {
  const formatDateTime = (dateTime?: string, date?: string) => {
    if (dateTime) {
      return new Date(dateTime).toLocaleString();
    }
    if (date) {
      return new Date(date).toLocaleDateString();
    }
    return 'Unknown';
  };

  return (
    <div className="event-detail">
      <div className="event-detail-header">
        <h3>{event.summary || 'Untitled Event'}</h3>
        <button className="btn-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="event-detail-body">
        {event.description && (
          <div className="detail-section">
            <h4>Description</h4>
            <p>{event.description}</p>
          </div>
        )}

        <div className="detail-section">
          <h4>Time</h4>
          <p>
            {formatDateTime(event.start?.dateTime, event.start?.date)}
            {event.end && (
              <>
                {' – '}
                {formatDateTime(event.end.dateTime, event.end.date)}
              </>
            )}
          </p>
        </div>

        {event.location && (
          <div className="detail-section">
            <h4>Location</h4>
            <p>{event.location}</p>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className="detail-section">
            <h4>Attendees</h4>
            <ul>
              {event.attendees.map((attendee) => (
                <li key={attendee.email}>
                  {attendee.displayName || attendee.email}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="event-detail-actions">
        <button
          className="btn-primary"
          onClick={onEdit}
          disabled={loading}
        >
          Edit
        </button>
        <button
          className="btn-danger"
          onClick={onDelete}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}