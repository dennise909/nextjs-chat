import * as React from 'react';
import { shareChat } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { PromptForm } from '@/components/prompt-form';
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom';
import { IconShare } from '@/components/ui/icons';
import { FooterText } from '@/components/footer';
import { ChatShareDialog } from '@/components/chat-share-dialog';
import { useAIState, useActions, useUIState } from 'ai/rsc';
import type { AI } from '@/lib/chat/actions';
import { nanoid } from 'nanoid';
import { UserMessage } from './stocks/message';
import Image from 'next/image';

export interface ChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom
}: ChatPanelProps) {
  const [aiState] = useAIState();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);

  const exampleMessages = [
    {
      heading: 'Book an appointment',
      message: `Want to book an appointment?`,
      src: "/icons/book-an-appointment.png"
    },
    {
      heading: 'Cancel or reschedule',
      message: `Want to cancel or reschedule the appointment?`,
      src: "/icons/cancel-or-reschedule-appointment.png"
    },
    {
      heading: 'Hair diagnose',
      message: `What is the current status of your hair?`,
      src: "/icons/hair-diagnose.png"
    },
    {
      heading: 'Hairstyle consultation',
      message: `Which haitsryle are you looking for?`,
      src: "/icons/hair-style-consultation.png"
    },
    {
      heading: 'Follow up treatment advice',
      message: `Do you need further help with your past service?`,
      src: "/icons/follow-up-treatment-advice.png"
    },
    {
      heading: 'Give us feedback',
      message: `Do you have any feedback for us?`,
      src: "/icons/feedback.png"
    }
  ];
  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <div
                key={example.heading}
                className="flex flex-col items-center justify-between w-40 gap-2 rounded-2xl border border-token-border-light p-4 text-start text-[15px] shadow-xxs transition hover:bg-gray-200 cursor-pointer"

                onClick={async () => {
                  setMessages(currentMessages => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>
                    }
                  ]);

                  const responseMessage = await submitUserMessage(example.message);

                  setMessages(currentMessages => [
                    ...currentMessages,
                    responseMessage,
                  ]);
                }}
              >
                <Image
                  src={example.src} // Provide the correct source for the image
                  alt="book-an-appointment"
                  width={60}
                  height={60}
                />

                {/* Text */}
                <div className="line-clamp-3 max-w-full text-balance text-gray-600 dark:text-gray-500 break-word text-center">
                  {example.heading}
                </div>

              </div>
            ))}
        </div>

        {messages?.length >= 2 ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              {id && title ? (
                <>
                  <button
                    className="flex items-center justify-center w-40 h-24 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <IconShare className="mr-2" />
                    Share
                  </button>
                  <ChatShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    onCopy={() => setShareDialogOpen(false)}
                    shareChat={shareChat}
                    chat={{
                      id,
                      title,
                      messages: aiState.messages,
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm input={input} setInput={setInput} />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}