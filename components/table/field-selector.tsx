import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import { useTranslation } from "react-i18next"

import { IField } from "@/lib/store/interface"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { makeHeaderIcons } from "@/components/table/views/grid/fields/header-icons"

import { Button } from "../ui/button"

const icons = makeHeaderIcons(18)

interface IFieldSelectorProps {
  fields: IField[]
  value?: string
  onChange: (value: string) => void
}

export const FieldSelector = ({
  fields,
  value,
  onChange,
}: IFieldSelectorProps) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const handleSelect = (field: IField) => {
    onChange(field.table_column_name)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          <div className="max-w-[150px] truncate">
            {value
              ? fields.find((field) => field.table_column_name === value)
                  ?.name || t("table.field.untitledField")
              : t("table.field.selectField")}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="click-outside-ignore w-[200px] p-0">
        <Command>
          <CommandInput placeholder={t("table.field.searchField")} />
          <CommandEmpty>{t("table.field.noFieldFound")}</CommandEmpty>
          <CommandList>
            {fields.map((field) => {
              const iconSvgString = icons[field.type]({
                bgColor: "#aaa",
                fgColor: "currentColor",
              })
              return (
                <CommandItem
                  key={field.table_column_name}
                  value={field.name}
                  onSelect={() => handleSelect(field)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: iconSvgString,
                      }}
                    ></span>
                    <p className="max-w-[150px] truncate " title={field.name}>
                      {field.name || t("table.field.untitledField")}
                    </p>
                  </span>
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
