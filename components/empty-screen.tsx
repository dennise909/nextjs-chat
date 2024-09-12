import GoogleCalendar from '@/components/calendar/GoogleCalendarFreeBusy'
import Image from 'next/image'; // Import the correct component
import { SessionProvider } from "next-auth/react";

export function EmptyScreen() {

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col items-center content-end gap-2 p-8">
        <Image
          src="/tylor-logo.svg" // Provide the correct source for the image
          alt="Tylor Logo"
          width={300}
          height={400}
        />
      </div>
     <SessionProvider><GoogleCalendar/></SessionProvider>
    </div>

  )
}
