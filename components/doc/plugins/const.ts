import {
  CHECK_LIST,
  CODE,
  HEADING,
  HIGHLIGHT,
  INLINE_CODE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  TRANSFORMERS,
  Transformer,
} from "@lexical/markdown"



import { BuiltInBlocks } from "../blocks"
import { BookmarkPayload } from "../blocks/bookmark/node"
import { HR, TABLE } from "./MarkdownTransformers"

export const allTransformers = [
  TABLE,
  CHECK_LIST,
  CODE,
  HEADING,
  HIGHLIGHT,
  INLINE_CODE,
  // IMAGE => Bookmarks  this order is important
  LINK,
  ORDERED_LIST,
  QUOTE,
  HR,
  ...TRANSFORMERS,
  ...BuiltInBlocks.map((block) => block.transform).filter(Boolean),
] as Transformer[]

export const fgColors = [
  { name: "default", value: "inherit" },
  { name: "red", value: "#ff8383ff" },
  { name: "orange", value: "#ffc379ff" },
  { name: "yellow", value: "#c4c76cff" },
  { name: "green", value: "#47873a" },
  { name: "cyan", value: "#70f3ffff" },
  { name: "blue", value: "#75aaffff" },
  { name: "indigo", value: "#9987ffff" },
  { name: "pink", value: "#ff9affff" },
]

export const bgColors = [
  { name: "default", value: "inherit" },
  { name: "red", value: "#ffadadff" },
  { name: "orange", value: "#ffd6a5ff" },
  { name: "yellow", value: "#fdffb6ff" },
  { name: "green", value: "#caffbfff" },
  { name: "cyan", value: "#9bf6ffff" },
  { name: "blue", value: "#a0c4ffff" },
  { name: "indigo", value: "#bdb2ffff" },
  { name: "pink", value: "#ffc6ffff" },
]

// global map for bookmark link info
export const markdownLinkInfoMap = new Map<string, BookmarkPayload>()
