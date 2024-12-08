/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    $getRoot,
    LexicalEditor,
    LexicalNode
} from "lexical"


import { Point } from "../../utils/point"
import { $createListItemNode, $isListItemNode, ListItemNode, ListNode } from "@lexical/list"
import { $createListNode } from "@lexical/list"
import { Rect } from "../../utils/rect"
import { ListType } from "@lexical/list"

const SPACE = 4
const TARGET_LINE_HALF_HEIGHT = 2
export const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu"
export const DRAG_DATA_FORMAT = "application/x-lexical-drag-block"
const TEXT_BOX_HORIZONTAL_PADDING = 18

const Downward = 1
const Upward = -1
const Indeterminate = 0

let prevIndex = Infinity

function getCurrentIndex(keysLength: number): number {
    if (keysLength === 0) {
        return Infinity
    }
    if (prevIndex >= 0 && prevIndex < keysLength) {
        return prevIndex
    }

    return Math.floor(keysLength / 2)
}

function getTopLevelNodeKeys(editor: LexicalEditor): string[] {
    return editor.getEditorState().read(() => $getRoot().getChildrenKeys())
}

export function getBlockElement(
    anchorElem: HTMLElement,
    editor: LexicalEditor,
    event: MouseEvent,
    draggedElement?: HTMLElement
): HTMLElement | null {
    const anchorElementRect = anchorElem.getBoundingClientRect()
    const target = event.target as HTMLElement

    if (target.tagName === "LI") {
        if (draggedElement && draggedElement.contains(target)) {
            return null
        }
        return target as HTMLElement
    }

    let currentElement = target
    while (currentElement && currentElement !== anchorElem) {
        if (currentElement.tagName === "LI") {
            if (draggedElement && draggedElement.contains(currentElement)) {
                return null
            }
            return currentElement as HTMLElement
        }
        currentElement = currentElement.parentElement as HTMLElement
    }

    const topLevelNodeKeys = getTopLevelNodeKeys(editor)
    let blockElem: HTMLElement | null = null

    editor.getEditorState().read(() => {
        let index = getCurrentIndex(topLevelNodeKeys.length)
        let direction = Indeterminate

        while (index >= 0 && index < topLevelNodeKeys.length) {
            const key = topLevelNodeKeys[index]
            const elem = editor.getElementByKey(key)
            if (elem === null) {
                break
            }
            const point = new Point(event.x, event.y)
            const domRect = Rect.fromDOM(elem)
            const { marginTop, marginBottom } = window.getComputedStyle(elem)

            const rect = domRect.generateNewRect({
                bottom: domRect.bottom + parseFloat(marginBottom),
                left: anchorElementRect.left,
                right: anchorElementRect.right,
                top: domRect.top - parseFloat(marginTop),
            })

            const {
                result,
                reason: { isOnTopSide, isOnBottomSide },
            } = rect.contains(point)

            if (result) {
                // 如果找到的是列表，尝试找到具体的列表项
                if (elem.tagName === "UL" || elem.tagName === "OL") {
                    const listItems = elem.getElementsByTagName("LI")
                    for (const li of listItems) {
                        const liRect = Rect.fromDOM(li as HTMLElement)
                        const { result: liResult } = liRect.contains(point)
                        if (liResult) {
                            blockElem = li as HTMLElement
                            break
                        }
                    }
                    if (!blockElem) {
                        blockElem = elem
                    }
                } else {
                    blockElem = elem
                }
                if (draggedElement && draggedElement.contains(blockElem)) {
                    blockElem = null
                }
                prevIndex = index
                break
            }

            if (direction === Indeterminate) {
                if (isOnTopSide) {
                    direction = Upward
                } else if (isOnBottomSide) {
                    direction = Downward
                } else {
                    direction = Infinity
                }
            }

            index += direction
        }
    })

    return blockElem
}

export function isOnMenu(element: HTMLElement): boolean {
    return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`)
}

export function setMenuPosition(
    targetElem: HTMLElement | null,
    floatingElem: HTMLElement,
    anchorElem: HTMLElement
) {
    if (!targetElem) {
        floatingElem.style.opacity = "0"
        floatingElem.style.transform = "translate(-10000px, -10000px)"
        return
    }

    const targetRect = targetElem.getBoundingClientRect()
    const targetStyle = window.getComputedStyle(targetElem)
    const floatingElemRect = floatingElem.getBoundingClientRect()
    const anchorElementRect = anchorElem.getBoundingClientRect()

    const top =
        targetRect.top +
        (parseInt(targetStyle.lineHeight, 10) - floatingElemRect.height) / 2 -
        anchorElementRect.top

    const left = targetRect.left - anchorElementRect.left

    floatingElem.style.opacity = "1"
    floatingElem.style.transform = `translate(${left}px, ${top}px)`
}

export function setDragImage(
    dataTransfer: DataTransfer,
    draggableBlockElem: HTMLElement
) {
    const { transform } = draggableBlockElem.style

    // Remove dragImage borders
    draggableBlockElem.style.transform = "translateZ(0)"
    dataTransfer.setDragImage(draggableBlockElem, 0, 0)

    setTimeout(() => {
        draggableBlockElem.style.transform = transform
    })
}

export function setTargetLine(
    targetLineElem: HTMLElement,
    targetBlockElem: HTMLElement,
    mouseY: number,
    anchorElem: HTMLElement,
    event: MouseEvent
) {
    const targetStyle = window.getComputedStyle(targetBlockElem)
    const { top: targetBlockElemTop, height: targetBlockElemHeight, left: targetBlockElemLeft } =
        targetBlockElem.getBoundingClientRect()
    const { top: anchorTop, width: anchorWidth } =
        anchorElem.getBoundingClientRect()

    let padding = TEXT_BOX_HORIZONTAL_PADDING
    if (targetBlockElem.tagName === 'LI') {
        const isFirstItem = targetBlockElem.getAttribute('value') === '1'
        const bulletWidth = 20

        // Only check for bullet hover if it's not the first item or if we're below the midpoint
        if (!isFirstItem || mouseY - targetBlockElemTop > targetBlockElemHeight / 2) {
            if ((event.clientX - targetBlockElemLeft) > bulletWidth) {
                padding += bulletWidth
            }
        }
    }

    let lineTop = targetBlockElemTop
    // At the bottom of the target
    if (mouseY - targetBlockElemTop > targetBlockElemHeight / 2) {
        lineTop += targetBlockElemHeight + parseFloat(targetStyle.marginBottom)
    } else {
        lineTop -= parseFloat(targetStyle.marginTop)
    }

    const top = lineTop - anchorTop - TARGET_LINE_HALF_HEIGHT
    const left = targetBlockElemLeft - anchorElem.getBoundingClientRect().left + padding
    const width = targetBlockElem.offsetWidth

    targetLineElem.style.transform = `translate(${left}px, ${top}px)`
    targetLineElem.style.width = `${width}px`
    targetLineElem.style.opacity = ".4"
}

export function hideTargetLine(targetLineElem: HTMLElement | null) {
    if (targetLineElem) {
        targetLineElem.style.opacity = "0"
        targetLineElem.style.transform = "translate(-10000px, -10000px)"
    }
}


export function $moveNode(
    draggedNode: LexicalNode,
    targetNode: LexicalNode,
    shouldInsertAfter: boolean,
    editor: LexicalEditor,
    event?: MouseEvent
) {
    // Handle list item indentation case
    if (draggedNode.__type === "listitem" &&
        (targetNode.__type === "list" || targetNode.__type === "listitem")) {

        if ($isListItemNode(targetNode) && event) {
            const targetElement = editor.getElementByKey(targetNode.getKey())
            if (targetElement) {
                const { left, top, height } = targetElement.getBoundingClientRect()
                const bulletWidth = 20
                const isFirstItem = targetElement.getAttribute('value') === '1'

                // Check if we should indent the list item
                if ((!isFirstItem || event.clientY - top > height / 2) &&
                    (event.clientX - left) > bulletWidth) {

                    // Insert and indent the dragged node
                    shouldInsertAfter ?
                        targetNode.insertAfter(draggedNode) :
                        targetNode.insertBefore(draggedNode);
                    (draggedNode as ListItemNode).setIndent((draggedNode as ListItemNode).getIndent() + 1)
                    return
                }
            }
        }
    }

    // Handle node type conversions
    let toBeMovedNode: LexicalNode = draggedNode

    // Convert to list if needed
    if (targetNode.__type !== "list" && draggedNode.__type === "listitem") {
        const parentList = draggedNode.getParent() as ListNode
        const listType: ListType = parentList?.__type === "list" ?
            parentList.getListType() : "bullet"

        const listNode = $createListNode(listType)
        listNode.append(draggedNode)
        toBeMovedNode = listNode
    }

    // Convert to list item if needed
    if (draggedNode.__type !== "listitem" && targetNode.__type === "listitem") {
        const listItemNode = $createListItemNode()
        listItemNode.append(draggedNode)
        toBeMovedNode = listItemNode
    }

    // Perform the insertion
    shouldInsertAfter ?
        targetNode.insertAfter(toBeMovedNode) :
        targetNode.insertBefore(toBeMovedNode)
}