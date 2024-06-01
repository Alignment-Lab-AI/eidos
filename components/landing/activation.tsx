import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useActivation } from "@/hooks/use-activation"


export const Activation = () => {
  const { active, isActivated } = useActivation()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const handleActive = async () => {
    setLoading(true)
    await active(code)
    setLoading(false)
  }
  if (isActivated) {
    return (
      <div>
        🎉You have already activated Eidos.
        <Button size="xs" variant="ghost" onClick={() => nav("/")}>
          Open App
        </Button>
      </div>
    )
  }
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex gap-2">
        <Input
          // autoFocus
          className="w-[300px]"
          placeholder="Enter Code"
          value={code}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleActive()
            }
          }}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button onClick={handleActive} disabled={loading}>
          Enter
        </Button>
      </div>

      <div className="mt-2 p-2 text-sm">
        Eidos is currently in development; join our{" "}
        <Link
          to="https://discord.gg/KAeDX8VEpK"
          target="_blank"
          className="text-blue-500"
        >
          Discord
        </Link>{" "}
        server to stay updated on the latest progress
      </div>
    </div>
  )
}
