import React from 'react';
import { GoogleEvent } from '../types';
import './CalendarGrid.css';

interface CalendarGridProps {
  date: Date;
  events: GoogleEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: GoogleEvent) => void;
}

export function CalendarGrid({ date, events, onDateClick, onEventClick }: CalendarGridProps) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const eventsByDate: { [key: string]: GoogleEvent[] } = {};
  events.forEach((event) => {
    const eventDate = event.start?.dateTime || event.start?.date;
    if (eventDate) {
      const dateKey = new Date(eventDate).toISOString().split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    }
  });

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-grid">
      <h2>{monthName} {year}</h2>
      <div className="weekdays">
        {weekDays.map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
      </div>
      <div className="days-grid">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="day empty"></div>;
          }

          const cellDate = new Date(year, month, day);
          const dateKey = cellDate.toISOString().split('T')[0];
          const dayEvents = eventsByDate[dateKey] || [];
          const isToday =
            cellDate.toDateString() === new Date().toDateString();

          return (
            <div
              key={day}
              className={`day ${isToday ? 'today' : ''}`}
              onClick={() => onDateClick(cellDate)}
            >
              <div className="day-number">{day}</div>
              <div className="day-events">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="event-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {event.summary || 'Untitled'}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="event-more">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}