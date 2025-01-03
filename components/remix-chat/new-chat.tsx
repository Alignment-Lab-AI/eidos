"use client"

import { useState } from "react"
import type { Attachment, Message } from "ai"
import { useChat } from "ai/react"
import { AnimatePresence } from "framer-motion"
import { useSWRConfig } from "swr"
import { useWindowSize } from "usehooks-ts"

import { useAiConfig } from "@/hooks/use-ai-config"

import { Block, type UIBlock } from "./components/block"
import { BlockStreamHandler } from "./components/block-stream-handler"
import { PreviewMessage, ThinkingMessage } from "./components/message"
import { MultimodalInput } from "./components/multimodal-input"
import { Overview } from "./components/overview"
import { useScrollToBottom } from "./components/use-scroll-to-bottom"
import type { Vote } from "./interface"

export function NewChat({
  id,
  initialMessages,
  selectedModelId,
}: {
  id: string
  initialMessages: Array<Message>
  selectedModelId: string
}) {
  const { mutate } = useSWRConfig()
  const { codingModel, getConfigByModel } = useAiConfig()

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    data: streamingData,
  } = useChat({
    body: {
      ...getConfigByModel(codingModel!),
      // systemPrompt: '',
      id,
      model: codingModel,
    },
    initialMessages,
    onFinish: () => {
      setMessages((currentMessages) => {
        console.log("messages:", currentMessages)
        // setChatHistory(currentMessages)
        return currentMessages
      })
    },
  })

  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize()

  const [block, setBlock] = useState<UIBlock>({
    documentId: "init",
    content: "",
    title: "",
    status: "idle",
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  })

  // const { data: votes } = useSWR<Array<Vote>>(`/api/vote?chatId=${id}`, fetcher)
  const votes: Array<Vote> = []

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>()

  const [attachments, setAttachments] = useState<Array<Attachment>>([])

  return (
    <>
      <div className="flex flex-col min-w-0 h-full bg-background relative">
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 pt-4 pb-[120px]"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              message={message}
              block={block}
              setBlock={setBlock}
              isLoading={isLoading && messages.length - 1 === index}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="flex-shrink-0 h-32 w-6"
            aria-hidden="true"
          />
        </div>

        <form className="flex mx-auto px-4 pb-4 md:pb-6 gap-2 w-full md:max-w-3xl sticky bottom-0 inset-x-0 bg-background">
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
          />
        </form>
      </div>

      <AnimatePresence>
        {block?.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            votes={votes}
          />
        )}
      </AnimatePresence>

      <BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />
    </>
  )
}
