import type { Path } from '@prisma/client'

export interface CreatePathInput {
  path: string
  name?: string | null
  description?: string | null
  userId: string
}

export interface UpdatePathInput {
  id: string
  path?: string
  name?: string
  description?: string
}

export async function getPaths(): Promise<Array<Path>> {
  try {
    const result = await window.electron.invoke('db:getPaths')
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  } catch (error) {
    console.error('Failed to fetch paths:', error)

    // Re-throw the original error when possible so that
    // DevTools shows the real cause (e.g. Prisma or DB issues)
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Failed to fetch paths')
  }
}

export async function createPath(input: CreatePathInput): Promise<Path> {
  try {
    if (!input.path || !input.userId || input.userId.trim() === '') {
      throw new Error('Path and userId are required')
    }

    const result = await window.electron.invoke('db:createPath', input)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  } catch (error) {
    console.error('Failed to create path:', error)
    throw new Error('Failed to create path')
  }
}

/**
 * Update an existing path
 */
export async function updatePath(input: UpdatePathInput): Promise<Path> {
  try {
    if (!input.id) {
      throw new Error('Path ID is required')
    }

    const result = await window.electron.invoke('db:updatePath', input)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  } catch (error) {
    console.error('Failed to update path:', error)
    throw new Error('Failed to update path')
  }
}

/**
 * Delete a path (hard delete)
 */
export async function deletePath(id: string): Promise<Path> {
  try {
    if (!id) {
      throw new Error('Path ID is required')
    }

    const result = await window.electron.invoke('db:deletePath', id)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  } catch (error: any) {
    if (error?.message === 'Path not found') {
      throw error
    }
    console.error('Failed to delete path:', error)
    throw new Error('Failed to delete path')
  }
}
