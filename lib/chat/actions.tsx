import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  render,
  createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'

import {
  spinner,
  BotMessage,
  SystemMessage,
} from '@/components/stocks'

import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat } from '@/lib/types'
import { auth } from '@/auth'
// import listAvailableSlots from '@/components/calendar/GoogleCalendarFreeBusy';

const listAvailableSlots = [
  {
    "start": "2024-09-08T09:09:09.877Z",
    "end": "2024-09-08T12:00:00.000Z"
  },
  {
    "start": "2024-09-08T14:00:00.000Z",
    "end": "2024-09-09T04:30:00.000Z"
  },
  {
    "start": "2024-09-09T06:30:00.000Z",
    "end": "2024-09-09T12:00:00.000Z"
  },
  {
    "start": "2024-09-09T14:00:00.000Z",
    "end": "2024-09-10T04:30:00.000Z"
  },
  {
    "start": "2024-09-10T06:30:00.000Z",
    "end": "2024-09-10T10:00:00.000Z"
  },
  {
    "start": "2024-09-10T10:30:00.000Z",
    "end": "2024-09-10T12:00:00.000Z"
  },
  {
    "start": "2024-09-10T13:00:00.000Z",
    "end": "2024-09-10T15:30:00.000Z"
  },
  {
    "start": "2024-09-10T18:45:00.000Z",
    "end": "2024-09-11T04:30:00.000Z"
  },
  {
    "start": "2024-09-11T06:30:00.000Z",
    "end": "2024-09-11T12:00:00.000Z"
  },
  {
    "start": "2024-09-11T13:00:00.000Z",
    "end": "2024-09-12T04:30:00.000Z"
  },
  {
    "start": "2024-09-12T06:30:00.000Z",
    "end": "2024-09-12T10:00:00.000Z"
  },
  {
    "start": "2024-09-12T11:00:00.000Z",
    "end": "2024-09-12T12:00:00.000Z"
  },
  {
    "start": "2024-09-12T17:00:00.000Z",
    "end": "2024-09-13T04:30:00.000Z"
  },
  {
    "start": "2024-09-13T06:30:00.000Z",
    "end": "2024-09-13T12:00:00.000Z"
  },
  {
    "start": "2024-09-13T13:00:00.000Z",
    "end": "2024-09-14T04:30:00.000Z"
  },
  {
    "start": "2024-09-14T06:30:00.000Z",
    "end": "2024-09-14T12:00:00.000Z"
  },
  {
    "start": "2024-09-14T13:00:00.000Z",
    "end": "2024-09-15T04:30:00.000Z"
  },
  {
    "start": "2024-09-15T06:30:00.000Z",
    "end": "2024-09-15T08:00:00.000Z"
  },
  {
    "start": "2024-09-15T09:00:00.000Z",
    "end": "2024-09-15T09:09:09.877Z"
  }
]

const services = {
  "categories": {
    "Haircuts": [
      {
        "name": "Quick Cut / Tips Cut",
        "price": "€30",
        "duration": "45 mins",
        "description": "A fast trim focused on the tips of the hair, maintaining the current hairstyle."
      },
      {
        "name": "Short Cut + Wash & Style",
        "price": "€40",
        "duration": "1 hour",
        "description": "Includes a wash, haircut for short hair, and a professional styling session."
      },
      {
        "name": "Long Cut + Wash & Dry",
        "price": "€50",
        "duration": "1 hour",
        "description": "Includes a wash, haircut for long hair, and a blow-dry finish."
      }
    ],
    "Balayage": [
      {
        "name": "Balayage Short",
        "price": "€150",
        "duration": "3 hours",
        "description": "Balayage technique for short hair, providing a natural, sun-kissed look."
      },
      {
        "name": "Balayage Long",
        "price": "€175",
        "duration": "3 hours",
        "description": "Balayage technique for long hair, offering a seamless blend of highlights."
      },
      {
        "name": "Balayage Extra",
        "price": "From €200",
        "duration": "4 hours",
        "description": "Extended balayage service for extra detail and customization."
      }
    ],
    "Highlights": [
      {
        "name": "Highlight Half",
        "price": "€165",
        "duration": "3 hours",
        "description": "Partial highlights for a subtle enhancement and dimension."
      },
      {
        "name": "Highlight Full",
        "price": "From €200",
        "duration": "4 hours",
        "description": "Full head highlights for a dramatic transformation."
      },
      {
        "name": "Highlights Contour",
        "price": "From €120",
        "duration": "2 hours",
        "description": "Face-framing highlights to enhance facial features."
      }
    ],
    "Bleaching": [
      {
        "name": "Shave & Bleach",
        "price": "€120",
        "duration": "2 hours",
        "description": "Combines a professional shave with a full bleach treatment."
      },
      {
        "name": "Total Bleach Short",
        "price": "€150",
        "duration": "3 hours",
        "description": "Complete bleach treatment for short hair."
      },
      {
        "name": "Total Bleach Medium",
        "price": "€175",
        "duration": "3 hours 30 mins",
        "description": "Complete bleach treatment for medium-length hair."
      },
      {
        "name": "Total Bleach Long",
        "price": "From €200",
        "duration": "4 hours",
        "description": "Complete bleach treatment for long hair."
      },
      {
        "name": "Root Bleach Touch-up",
        "price": "€140",
        "duration": "3 hours",
        "description": "Touch-up service focusing on bleaching the roots."
      },
      {
        "name": "Bleach Re-Do",
        "price": "From €170",
        "duration": "4 hours",
        "description": "Correctional bleach service for previous bleach jobs."
      }
    ],
    "Coloring": [
      {
        "name": "Color Block",
        "price": "From €140",
        "duration": "2 hours 30 mins",
        "description": "Bold color blocks for a striking and modern look."
      },
      {
        "name": "Toner Refresh",
        "price": "€60",
        "duration": "1 hour",
        "description": "Refreshes color tones and neutralizes brassiness."
      },
      {
        "name": "Hair Color",
        "price": "From €110",
        "duration": "2 hours",
        "description": "Full hair coloring service with a wide range of color options."
      },
      {
        "name": "Color Design",
        "price": "From €115",
        "duration": "2 hours",
        "description": "Customized color design for unique and personalized looks."
      },
      {
        "name": "Color Root Touch-Up",
        "price": "€85",
        "duration": "1 hour 30 mins",
        "description": "Touch-up service focusing on coloring the roots."
      }
    ],
    "Treatments": [
      {
        "name": "Styling",
        "price": "€40",
        "duration": "15 mins",
        "description": "Professional styling session for various occasions."
      },
      {
        "name": "Olaplex №1 & №2",
        "price": "€50",
        "duration": "15 mins",
        "description": "Bond-repair treatment using Olaplex products."
      }
    ],
    "Consultations": [
      {
        "name": "General Consultation",
        "price": "€0",
        "duration": "15 mins",
        "description": "Free consultation to discuss hair goals and services."
      },
      {
        "name": "Bleach test",
        "price": "€0",
        "duration": "15 mins",
        "description": "Test to check hair compatibility with bleach."
      }
    ]
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode
  // console.log("hours", listAvailableSlots)
  const ui = render({
    model: 'gpt-4o',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: `
        You are a helpful receptionist at a hairsalon bot designed to assist users in scheduling appointments 
        and providing information about various hairdressing services. 
        Below is a list of services you offer in JSON format. 
        Use this information to respond to users questions and help them schedule appointments.
        Services: ${JSON.stringify(services, null, 2)}
        When responding to users, refer to the services mentioned above and provide detailed information based on their questions. 
        Assist them in scheduling appointments and offer suggestions tailored to their needs.
        When offering available times, use the listAvailableSlots provided as a JSON format. 
        Present only the start times as options and ask users the day they would like to book and if they prefer morning, afternoon, or evening slots. 
        Ensure the offered times fall within the show times of 10:00 AM to 7:00 PM.
        Avaialble Hours: ${listAvailableSlots}
        After they have selected the hours ask for their name, email address and phone number to confirm the booking.
        Confirm the booking by providing the user with the details of the appointment and give the confirmation number QC12345.
        `
      },
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    }
  })

  return {
    id: nanoid(),
    display: ui
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id: string
  name?: string
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]



export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'function' ? (
          null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}


