import { useCallback, useEffect, useMemo, useState } from "react"
import update from "immutability-helper"
import { sortBy } from "lodash"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import { IView } from "@/lib/store/IView"
import { IField } from "@/lib/store/interface"
import { useCurrentUiColumns } from "@/hooks/use-ui-columns"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useViewOperation } from "../hooks"
import { FieldItemCard } from "./view-field-hidden-item"

export interface ContainerState {
  cards: IField[]
}

export const ViewFieldHidden = (props: { view?: IView }) => {
  const orderMap = useMemo(
    () => props.view?.orderMap || {},
    [props.view?.orderMap]
  )
  const hiddenFields = useMemo(
    () => props.view?.hiddenFields || [],
    [props.view?.hiddenFields]
  )
  const { uiColumns } = useCurrentUiColumns()

  const [cards, setCards] = useState<IField[]>([])
  const sortedUiColumns = useMemo(
    () =>
      sortBy(uiColumns, (item) => {
        return orderMap[item.table_column_name] || 0
      }),
    [orderMap, uiColumns]
  )

  useEffect(() => {
    setCards(sortedUiColumns)
  }, [sortedUiColumns])

  const { updateView } = useViewOperation()
  const updateViewOrderMap = useCallback(
    (newOrderMap: IView["orderMap"]) => {
      props.view && updateView(props.view?.id, { orderMap: newOrderMap })
    },
    [props.view, updateView]
  )

  const updateHiddenFields = useCallback(
    (newHiddenFields: string[]) => {
      props.view &&
        updateView(props.view?.id, { hiddenFields: newHiddenFields })
    },
    [props.view, updateView]
  )

  const handleHideField = useCallback(
    (fieldId: string) => {
      const hiddenFieldsSet = new Set([...(hiddenFields || [])])
      if (hiddenFieldsSet.has(fieldId)) {
        hiddenFieldsSet.delete(fieldId)
      } else {
        hiddenFieldsSet.add(fieldId)
      }
      updateHiddenFields(Array.from(hiddenFieldsSet))
    },
    [hiddenFields, updateHiddenFields]
  )

  const showAllFields = () => {
    updateHiddenFields([])
  }

  const hideAllFields = () => {
    updateHiddenFields(
      uiColumns
        .filter((field) => field.table_column_name !== "title")
        .map((item) => item.table_column_name)
    )
  }

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setCards((prevCards: IField[]) => {
        const newCards = update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex] as IField],
          ],
        })
        const newOrderMap: IView["orderMap"] = {}
        newCards.forEach((item, index) => {
          newOrderMap[item.table_column_name] = index
        })
        updateViewOrderMap(newOrderMap)
        return newCards
      })
    },
    [updateViewOrderMap]
  )

  const renderCard = useCallback(
    (card: IField, index: number) => {
      const isHidden =
        (hiddenFields || []).indexOf(card.table_column_name) !== -1
      return (
        <FieldItemCard
          key={card.table_column_name}
          index={index}
          id={card.table_column_name}
          isHidden={isHidden}
          text={card.name}
          onToggleHidden={handleHideField}
          moveCard={moveCard}
        />
      )
    },
    [handleHideField, hiddenFields, moveCard]
  )

  return (
    <Popover>
      <PopoverTrigger className={"rounded-md px-2"}>Fields</PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <DndProvider backend={HTML5Backend}>
          <div className="w-[400px]">
            {cards.map((card, i) => renderCard(card, i))}
          </div>
        </DndProvider>
        <hr className="my-2"/>
        <div className="flex justify-between px-2">
          <Button size="sm" variant="ghost" onClick={showAllFields}>
            show all
          </Button>
          <Button size="sm" variant="ghost" onClick={hideAllFields}>
            hide all
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}