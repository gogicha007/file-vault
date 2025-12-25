import { prisma } from '@/db'
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

/**
 * Get all active paths
 */
export async function getPaths(): Promise<Path[]> {
  try {
    const paths = await prisma.path.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return paths
  } catch (error) {
    console.error('Failed to fetch paths:', error)
    throw new Error('Failed to fetch paths')
  }
}

/**
 * Create a new path
 */
export async function createPath(input: CreatePathInput): Promise<Path> {
  try {
    if (!input.path || !input.userId) {
      throw new Error('Path and userId are required')
    }

    const newPath = await prisma.path.create({
      data: {
        path: input.path,
        name: input.name || null,
        description: input.description || null,
        userId: input.userId,
      },
    })

    return newPath
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

    const updatedPath = await prisma.path.update({
      where: { id: input.id },
      data: {
        ...(input.path && { path: input.path }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
    })

    return updatedPath
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

    const deletedPath = await prisma.path.delete({
      where: { id },
    })

    return deletedPath
  } catch (error: any) {
    // Prisma error code for record not found
    if (error?.code === 'P2025') {
      throw new Error('Path not found')
    }

    console.error('Failed to delete path:', error)
    throw new Error('Failed to delete path')
  }
}
