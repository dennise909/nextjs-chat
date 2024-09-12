'use client';

// import React, { useEffect, useState } from 'react';
// import { gapi } from 'gapi-script';

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
// const API_KEY = process.env.GOOGLE_CLIENT_SECRET
// const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
// const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// const GoogleCalendar: React.FC = () => {
//   const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
//   const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);

//   useEffect(() => {
//     const initClient = () => {
//       gapi.client
//         .init({
//           apiKey: API_KEY,
//           clientId: CLIENT_ID,
//           discoveryDocs: DISCOVERY_DOCS,
//           scope: SCOPES,
//         })
//         .then(() => {
//           const authInstance = gapi.auth2.getAuthInstance();
//           setIsSignedIn(authInstance.isSignedIn.get());
//           authInstance.isSignedIn.listen(setIsSignedIn);
//         });
//     };

//     gapi.load('client:auth2', initClient);
//   }, []);

//   const handleAuthClick = () => {
//     gapi.auth2.getAuthInstance().signIn();
//   };

//   const handleSignoutClick = () => {
//     gapi.auth2.getAuthInstance().signOut();
//   };

//   const listAvailableSlots = () => {
//     const timeMin = new Date().toISOString();
//     const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // One week from now

//     gapi.client.calendar.freebusy
//       .query({
//         resource: {
//           timeMin,
//           timeMax,
//           timeZone: 'UTC',
//           items: [{ id: 'primary' }],
//         },
//       })
//       .then((response: any) => {
//         const busyTimes = response.result.calendars.primary.busy;
//         const availableSlots = findAvailableSlots(busyTimes, timeMin, timeMax);
//         setAvailableSlots(availableSlots);
//       });


//   };

//   // Remove then so its just shared as a sync function

//  const findAvailableSlots = (busyTimes: { start: string; end: string }[], start: string, end: string) => {
//     let slots: { start: string; end: string }[] = [];
//     let startTime = new Date(start).getTime();
//     let endTime = new Date(end).getTime();

//     if (busyTimes.length === 0) {
//       slots.push({ start: new Date(startTime).toISOString(), end: new Date(endTime).toISOString() });
//       return slots;
//     }

//     busyTimes.forEach((busy, index) => {
//       let busyStart = new Date(busy.start).getTime();
//       let busyEnd = new Date(busy.end).getTime();

//       if (startTime < busyStart) {
//         slots.push({ start: new Date(startTime).toISOString(), end: new Date(busyStart).toISOString() });
//       }

//       startTime = busyEnd;

//       if (index === busyTimes.length - 1 && busyEnd < endTime) {
//         slots.push({ start: new Date(busyEnd).toISOString(), end: new Date(endTime).toISOString() });
//       }
//     });

//     return slots;
//   };

//   console.log(JSON.stringify(availableSlots, null, 2))
//   // localStorage.setItem('google-slots', JSON.stringify(availableSlots));

//   const formatDate = (dateString: string) => {
//     const options: Intl.DateTimeFormatOptions = {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     };
//     return new Date(dateString).toLocaleString('en-US', options);
//   };
//   return (
//     <div>
//       {/* {isSignedIn ? (
//         <button onClick={handleSignoutClick}>sign in</button>
//       ) : (
//         <button onClick={handleAuthClick}>Auth check</button>
//       )}
//       {isSignedIn && (
//         <div>
//           {<button onClick={listAvailableSlots}>List Available Slots</button>}
//           <div>
//             {availableSlots.map((slot, index) => (
//               <div key={index}>
//                 <p>Start: {formatDate(slot.start)}</p>
//                 <p>End: {formatDate(slot.end)}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )} */}
//     </div>
//   );
// };

// export default GoogleCalendar;

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

const GoogleCalendar = () => {
  const { data: session } = useSession();
  const [calendarData, setCalendarData] = useState<any>(null);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCalendarEvents(session.accessToken);
    }
  }, [session]);

  const fetchCalendarEvents = async (accessToken) => {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    setCalendarData(data);
  };

  return (
    <div>
      {!session ? (
        <button onClick={() => signIn('google')}>Sign in with Google</button>
      ) : (
        <div>
          <button onClick={() => signOut()}>Sign out</button>
          {calendarData ? (
            <div>
              <h2>Google Calendar Events:</h2>
              <pre>{JSON.stringify(calendarData, null, 2)}</pre>
            </div>
          ) : (
            <p>Loading calendar events...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleCalendar;