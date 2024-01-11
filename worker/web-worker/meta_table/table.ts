import { IView } from "@/lib/store/IView"

import { DataSpace } from "../DataSpace"
import { MetaTable } from "./base"

interface ITable {
  id: string
  name: string
  views: IView[]
}

export class Table implements MetaTable<ITable> {
  constructor(protected dataSpace: DataSpace) {}
  add(data: ITable): Promise<ITable> {
    throw new Error("Method not implemented.")
  }

  async isExist(id: string): Promise<boolean> {
    const tableNode = await this.dataSpace.getTreeNode(id)
    return Boolean(tableNode)
  }

  async get(id: string): Promise<ITable | null> {
    const views = await this.dataSpace.listViews(id)
    const tableNode = await this.dataSpace.getTreeNode(id)
    if (!tableNode) {
      return null
    }
    return {
      id: tableNode.id,
      name: tableNode.name,
      views,
    }
  }
  set(id: string, data: Partial<ITable>): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
  async del(id: string): Promise<boolean> {
    const rawTableName = `tb_${id}`
    await this.dataSpace.withTransaction(async () => {
      // delete table
      await this.dataSpace.exec2(`DROP TABLE ${rawTableName}`)
      // delete fields
      await this.dataSpace.column.deleteByRawTableName(rawTableName)
      // delete views
      await this.dataSpace.view.deleteByTableId(id)
      // delete tree node
      await this.dataSpace.tree.del(id)
    })
    return true
  }
}