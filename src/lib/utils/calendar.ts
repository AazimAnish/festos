export function generateCalendarEvent(eventData: {
  title: string;
  location: string;
  date: string;
  time: string;
}) {
  const calendarData = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${eventData.title}
LOCATION:${eventData.location}
DTSTART:20250115T100000
DTEND:20250115T180000
DESCRIPTION:Join us for ${eventData.title}
END:VEVENT
END:VCALENDAR`;

  return calendarData;
}

export function downloadCalendarFile(calendarData: string, eventTitle: string) {
  const blob = new Blob([calendarData], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventTitle.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
