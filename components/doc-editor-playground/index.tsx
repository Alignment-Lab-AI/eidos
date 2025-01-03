import * as React from "react"
import { useEffect, useState } from "react"
import * as LexicalMarkdown from "@lexical/markdown"
import * as BlockWithAlignableContents from "@lexical/react/LexicalBlockWithAlignableContents"
import * as LexicalComposerContext from "@lexical/react/LexicalComposerContext"
import * as LexicalUtils from "@lexical/utils"
import * as Lexical from "lexical"

import { InnerEditor } from "../doc/editor"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"

const SCRIPT_ELEMENT_ID = "playground-ext-plugin-loader"

class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          Plugin Error: {this.state.error?.message || "Something went wrong"}
        </div>
      )
    }

    return this.props.children
  }
}

export function DocEditorPlayground({ code }: { code: string }) {
  const [loading, setLoading] = useState(true)
  const [disableExtPlugins, setDisableExtPlugins] = useState(true)
  useEffect(() => {
    setLoading(true)
    ;(window as any)["__REACT"] = React
    ;(window as any)["__LEXICAL"] = Lexical
    ;(window as any)["__@LEXICAL/UTILS"] = LexicalUtils
    ;(window as any)["__@LEXICAL/MARKDOWN"] = LexicalMarkdown
    ;(window as any)["__@LEXICAL/REACT/LEXICALCOMPOSERCONTEXT"] =
      LexicalComposerContext
    ;(window as any)["__@LEXICAL/REACT/LEXICALBLOCKWITHALIGNABLECONTENTS"] =
      BlockWithAlignableContents

    const script = document.createElement("script")
    script.id = SCRIPT_ELEMENT_ID
    script.type = "module"
    const pluginBlob = new Blob([code], {
      type: "application/javascript;charset=utf-8",
    })
    const pluginUrl = URL.createObjectURL(pluginBlob)
    const scriptContent = `
      import MyPlugin from "${pluginUrl}"
      window.__DOC_EXT_PLUGINS_PLAYGROUND = [{
        name: "MyPlugin",
        plugin: MyPlugin
      }]
    `
    const existingScript = document.getElementById(SCRIPT_ELEMENT_ID)
    if (existingScript) {
      existingScript.remove()
    }

    script.innerHTML = scriptContent
    document.body.appendChild(script)
    setTimeout(() => {
      const MyPlugin = (window as any).__DOC_EXT_PLUGINS_PLAYGROUND?.[0]
      if (MyPlugin) {
        setLoading(false)
      }
    }, 1000)
  }, [code])

  if (loading) {
    return <div>Loading Plugin...</div>
  }
  const plugin = (window as any).__DOC_EXT_PLUGINS_PLAYGROUND?.[0]
  if (!plugin) {
    return <div>No plugin found</div>
  }
  return (
    <ErrorBoundary>
      <div role="toolbar">
        <div className="flex items-center gap-2">
          <Label htmlFor="disable-ext-plugins">Disable Other Ext Plugins</Label>
          <Switch
            id="disable-ext-plugins"
            checked={disableExtPlugins}
            onCheckedChange={setDisableExtPlugins}
          />
        </div>
      </div>
      <hr className="my-2" />
      <div className="px-8 py-4 w-full">
        <InnerEditor
          isEditable
          plugins={React.createElement(plugin.plugin)}
          disableExtPlugins={disableExtPlugins}
        />
      </div>
    </ErrorBoundary>
  )
}
