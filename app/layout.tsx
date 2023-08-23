"use client"

import "@/styles/globals.css"
import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import {
  EidosSharedEnvChannelName,
  MainServiceWorkerMsgType,
} from "@/lib/const"
import { useWorker } from "@/hooks/use-worker"
import { Toaster } from "@/components/ui/toaster"
// import { AIChat } from "@/components/ai-chat/ai-chat"
import AIChat from "@/components/ai-chat/ai-chat-new"
import { CommandDialogDemo } from "@/components/cmdk"
import { ShortCuts } from "@/components/shortcuts"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

import { useSpaceAppStore } from "./[database]/store"
import { useConfigStore } from "./settings/store"

const useRootLayoutInit = () => {
  const { aiConfig } = useConfigStore()
  useEffect(() => {
    const mainServiceWorkerChannel = new BroadcastChannel(
      EidosSharedEnvChannelName
    )

    mainServiceWorkerChannel.postMessage({
      type: MainServiceWorkerMsgType.SetData,
      data: {
        apiKey: aiConfig.token,
      },
    })
    return () => {
      mainServiceWorkerChannel.close()
    }
  }, [aiConfig.token])
}

export default function RootLayout() {
  const { isAiOpen } = useSpaceAppStore()
  const { isInitialized, initWorker } = useWorker()

  useEffect(() => {
    // load worker when app start
    if (!isInitialized) {
      initWorker()
    }
  }, [initWorker, isInitialized])

  useRootLayoutInit()

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {/* APP MODEL， a sidebar and main */}
      <div className="flex h-screen w-screen overflow-auto">
        <div className="h-full w-full grow">
          <Outlet />
        </div>
        {isAiOpen && <AIChat />}
      </div>
      <CommandDialogDemo />
      <ShortCuts />
      <TailwindIndicator />
      <Toaster />
    </ThemeProvider>
  )
}
