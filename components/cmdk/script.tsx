import { useEffect, useRef, useState } from "react"
import { ICommand, IScript } from "@/worker/meta_table/script"
import { useKeyPress } from "ahooks"

import { ActionExecutor } from "@/lib/action/action"
import { useAppRuntimeStore } from "@/lib/store/runtime-store"
import { useCurrentNode } from "@/hooks/use-current-node"
import { useCurrentPathInfo } from "@/hooks/use-current-pathinfo"
import { useScripts } from "@/hooks/use-scripts"

import { CommandDialogDemo } from "."
import { useScriptFunction } from "../script-container/hook"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../ui/command"
import { useInput } from "./hooks"

export const ScriptList = () => {
  const { isCmdkOpen, setCmdkOpen } = useAppRuntimeStore()
  const { input, setInput, mode } = useInput()
  const { callFunction } = useScriptFunction()
  const [currentAction, setCurrentAction] = useState<IScript>()
  const [currentCommand, setCurrentCommand] = useState<ICommand>()
  const { space } = useCurrentPathInfo()
  const currentNode = useCurrentNode()
  const scripts = useScripts(space)
  const inputRef = useRef<HTMLInputElement>(null)
  const onItemSelect = (action: IScript, subCommand?: ICommand) => () => {
    const paramsString = Object.keys(
      subCommand?.inputJSONSchema?.properties || {}
    )
      .map((param) => {
        return `--${param}=`
      })
      .join(" ")
    let input = subCommand ? `/${subCommand?.name}` : `/${action.name}`
    if (paramsString.length > 0) {
      input += ` ${paramsString}`
    }
    setInput(input)
    setTimeout(() => {
      setCurrentAction(action)
      subCommand && setCurrentCommand(subCommand)
    }, 400)
  }

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        const length = inputRef.current.value.length
        inputRef.current.setSelectionRange(length, length)
      }
    }, 0)
  }, [])

  useKeyPress("Enter", () => {
    if (currentAction) {
      console.log("executing command: " + input)
      const realParams: Record<string, any> = ActionExecutor.getParams(input)
      callFunction({
        input: realParams,
        command: currentCommand?.name || "default",
        context: {
          tables: currentAction.fieldsMap,
          env: currentAction.envMap,
          currentNodeId: currentNode?.id,
        },
        code: currentAction.code,
        id: currentAction.id,
      })
      setInput("")
      setCmdkOpen(false)
    }
  })

  if (mode === "search") {
    return <CommandDialogDemo />
  }
  return (
    <CommandDialog open={isCmdkOpen} onOpenChange={setCmdkOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        value={input}
        ref={inputRef}
        onValueChange={setInput}
        autoFocus={false}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {scripts.map((script) => {
            const hasCommands = Boolean(script.commands?.length)
            const scriptValue = `/${script.name}`
            return (
              <>
                {hasCommands ? (
                  <>
                    {script.commands?.map((subCommand) => {
                      const value = `/${script.name} ${subCommand.name}`
                      const showValue = `/${subCommand.name}`
                      return (
                        <CommandItem
                          onSelect={onItemSelect(script, subCommand)}
                          key={value}
                          value={value}
                        >
                          <div className="flex flex-col">
                            <div className="flex gap-1 font-semibold">
                              {showValue}
                              <div className="ml-2 flex gap-1">
                                {Object.keys(
                                  subCommand.inputJSONSchema?.properties || {}
                                ).map((name) => {
                                  return <span key={name}>{` ${name}`}</span>
                                })}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {subCommand.description}
                            </span>
                          </div>
                          <CommandShortcut>{script.name}</CommandShortcut>
                        </CommandItem>
                      )
                    })}
                  </>
                ) : (
                  <CommandItem
                    onSelect={onItemSelect(script)}
                    key={script.id}
                    value={scriptValue}
                  >
                    {scriptValue}
                    <CommandShortcut>{script.name}</CommandShortcut>
                  </CommandItem>
                )}
              </>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}