import type { PathItem } from '../Settings'
import * as pathsApi from '@/api/paths'

export const settingsApi = {
  getPaths: async () => {
    try {
      const result = await pathsApi.getPaths()
      return result
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  },

  addPath: async (data: PathItem, userId: string) => {
    try {
      const result = await pathsApi.createPath({
        path: data.path,
        name: data.path.split('\\').pop() || 'Unnamed',
        description: data.description,
        userId,
      })
      return result
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  },

  updatePath: async (data: Partial<PathItem>) => {
    try {
      if (!data.id) {
        throw new Error('Path ID is required')
      }

      const result = await pathsApi.updatePath({
        id: data.id,
        path: data.path,
        description: data.description,
      })
      return result
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  },

  deletePath: async (id: string) => {
    try {
      const result = await pathsApi.deletePath(id)
      return result
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  },
}