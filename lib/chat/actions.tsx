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
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase
} from '@/components/stocks'

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
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
import { listAvailableSlots } from '@/components/calendar/GoogleCalendarFreeBusy';

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

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages.slice(0, -1),
        {
          id: nanoid(),
          role: 'function',
          name: 'showStockPurchase',
          content: JSON.stringify({
            symbol,
            price,
            defaultAmount: amount,
            status: 'completed'
          })
        },
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${amount * price
            }]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

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

  const ui = render({
    model: 'gpt-4o',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: `
        You are a helpful hairdresser bot designed to assist users in scheduling appointments and providing information about various hairdressing services. Below is a list of services you offer in JSON format. Use this information to respond to users' questions and help them schedule appointments.
        
        Services: ${JSON.stringify(services, null, 2)}
        
        When responding to users, refer to the services above and provide detailed information based on their questions. Assist them in scheduling appointments and offer suggestions tailored to their needs.
        
        When offering the available times use the Available hours list of open times, ask if they prefer the time during the morning or evening and just show times from 10:30am to 19:00pm 
        
        Avaialble Hours: ${listAvailableSlots}
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
    },
    functions: {
      listStocks: {
        description: 'List three imaginary stocks that are trending.',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the stock'),
              price: z.number().describe('The price of the stock'),
              delta: z.number().describe('The change in price of the stock')
            })
          )
        }),
        render: async function* ({ stocks }) {
          yield (
            <BotCard>
              <StocksSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'listStocks',
                content: JSON.stringify(stocks)
              }
            ]
          })

          return (
            <BotCard>
              <Stocks props={stocks} />
            </BotCard>
          )
        }
      },
      showStockPrice: {
        description:
          'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          delta: z.number().describe('The change in price of the stock')
        }),
        render: async function* ({ symbol, price, delta }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showStockPrice',
                content: JSON.stringify({ symbol, price, delta })
              }
            ]
          })

          return (
            <BotCard>
              <Stock props={{ symbol, price, delta }} />
            </BotCard>
          )
        }
      },
      showStockPurchase: {
        description:
          'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          numberOfShares: z
            .number()
            .describe(
              'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
            )
        }),
        render: async function* ({ symbol, price, numberOfShares = 100 }) {
          if (numberOfShares <= 0 || numberOfShares > 1000) {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'system',
                  content: `[User has selected an invalid amount]`
                }
              ]
            })

            return <BotMessage content={'Invalid amount'} />
          }

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showStockPurchase',
                content: JSON.stringify({
                  symbol,
                  price,
                  numberOfShares
                })
              }
            ]
          })

          return (
            <BotCard>
              <Purchase
                props={{
                  numberOfShares,
                  symbol,
                  price: +price,
                  status: 'requires_action'
                }}
              />
            </BotCard>
          )
        }
      },
      getEvents: {
        description:
          'List funny imaginary events between user highlighted dates that describe stock activity.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event')
            })
          )
        }),
        render: async function* ({ events }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'getEvents',
                content: JSON.stringify(events)
              }
            ]
          })

          return (
            <BotCard>
              <Events props={events} />
            </BotCard>
          )
        }
      }
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
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state, done }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

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
          message.name === 'listStocks' ? (
            <BotCard>
              <Stocks props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPrice' ? (
            <BotCard>
              <Stock props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPurchase' ? (
            <BotCard>
              <Purchase props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'getEvents' ? (
            <BotCard>
              <Events props={JSON.parse(message.content)} />
            </BotCard>
          ) : null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
