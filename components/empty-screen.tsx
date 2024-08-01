import GoogleCalendar from '@/components/calendar/GoogleCalendarFreeBusy'
import Image from 'next/image'; // Import the correct component

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col items-center gap-2 p-8">
        <Image
          src="/nerea-logo.png" // Provide the correct source for the image
          alt="Nerea Logo"
          width={250}
          height={300}
        />
      </div>
      <GoogleCalendar />
    </div>

  )
}
