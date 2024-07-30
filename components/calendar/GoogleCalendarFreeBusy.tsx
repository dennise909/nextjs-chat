"use client";

import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

const GoogleCalendar: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);

  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
        });
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleSignoutClick = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  const listAvailableSlots = () => {
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // One week from now

    gapi.client.calendar.freebusy
      .query({
        resource: {
          timeMin,
          timeMax,
          timeZone: 'UTC',
          items: [{ id: 'primary' }],
        },
      })
      .then((response: any) => {
        const busyTimes = response.result.calendars.primary.busy;
        const availableSlots = findAvailableSlots(busyTimes, timeMin, timeMax);
        setAvailableSlots(availableSlots);
      });

    
  };

  const findAvailableSlots = (busyTimes: { start: string; end: string }[], start: string, end: string) => {
    let slots: { start: string; end: string }[] = [];
    let startTime = new Date(start).getTime();
    let endTime = new Date(end).getTime();

    if (busyTimes.length === 0) {
      slots.push({ start: new Date(startTime).toISOString(), end: new Date(endTime).toISOString() });
      return slots;
    }

    busyTimes.forEach((busy, index) => {
      let busyStart = new Date(busy.start).getTime();
      let busyEnd = new Date(busy.end).getTime();

      if (startTime < busyStart) {
        slots.push({ start: new Date(startTime).toISOString(), end: new Date(busyStart).toISOString() });
      }

      startTime = busyEnd;

      if (index === busyTimes.length - 1 && busyEnd < endTime) {
        slots.push({ start: new Date(busyEnd).toISOString(), end: new Date(endTime).toISOString() });
      }
    });

    return slots;
  };
  
  console.log(JSON.stringify(availableSlots, null, 2))

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };
  return (
    <div>
    {isSignedIn ? (
      <button onClick={handleSignoutClick}>Sign Out</button>
    ) : (
      <button onClick={handleAuthClick}>Authorize</button>
    )}
    {isSignedIn && (
      <div>
        <button onClick={listAvailableSlots}>List Available Slots</button>
        <div>
          {availableSlots.map((slot, index) => (
            <div key={index}>
              <p>Start: {formatDate(slot.start)}</p>
              <p>End: {formatDate(slot.end)}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
};

export default GoogleCalendar;

