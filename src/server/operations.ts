import { HttpError } from 'wasp/server'
import type {
  GetItems,
  CreateItem,
  UpdateItem,
  DeleteItem,
  GetActivities,
  GetTags,
  CreateTag,
  UpdateItemRelevance,
  TestAIConnection,
  TestTagSuggestion,
  TestAIProvider,
  CompareProviders,
  SetAIProvider,
  TestGoogleAI
} from 'wasp/server/operations'
import type { Item, Tag, Activity } from 'wasp/entities'
import { aiService } from './ai/index'

// ============================================================================
// ITEM OPERATIONS
// ============================================================================

export const getItems: GetItems<{ activityId?: number }, Item[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const whereClause: any = {
    userId: context.user.id
  };

  // Filter by activity if provided
  if (args.activityId) {
    whereClause.activityId = args.activityId;
  }

  return context.entities.Item.findMany({
    where: whereClause,
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      activity: true
    },
    orderBy: [
      { relevance: 'desc' }, // Higher relevance first
      { createdAt: 'desc' }   // Most recent first
    ]
  });
}

type CreateItemInput = {
  content: string;
  sourceNote?: string;
  activityId?: number;
  tagIds?: number[];
}

export const createItem: CreateItem<CreateItemInput, Item> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Create the item first
  const item = await context.entities.Item.create({
    data: {
      content: args.content,
      sourceNote: args.sourceNote,
      activityId: args.activityId,
      userId: context.user.id,
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      activity: true
    }
  });

  // If tags are provided, create the tag associations
  if (args.tagIds && args.tagIds.length > 0) {
    // Limit to 3 tags as per requirements
    const limitedTagIds = args.tagIds.slice(0, 3);
    
    await Promise.all(
      limitedTagIds.map(tagId =>
        context.entities.ItemTag.create({
          data: {
            itemId: item.id,
            tagId: tagId
          }
        })
      )
    );

    // Return the item with tags included
    return context.entities.Item.findUnique({
      where: { id: item.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        activity: true
      }
    }) as Promise<Item>;
  }

  return item;
}

type UpdateItemInput = {
  id: number;
  content?: string;
  isCompleted?: boolean;
  activityId?: number;
  tagIds?: number[];
}

export const updateItem: UpdateItem<UpdateItemInput, Item> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Verify item belongs to user
  const existingItem = await context.entities.Item.findFirst({
    where: { 
      id: args.id, 
      userId: context.user.id 
    }
  });

  if (!existingItem) {
    throw new HttpError(404, 'Item not found');
  }

  // Update the item
  await context.entities.Item.update({
    where: { id: args.id },
    data: {
      content: args.content,
      isCompleted: args.isCompleted,
      activityId: args.activityId,
      updatedAt: new Date()
    }
  });

  // Handle tag updates if provided
  if (args.tagIds !== undefined) {
    // Remove existing tag associations
    await context.entities.ItemTag.deleteMany({
      where: { itemId: args.id }
    });

    // Add new tag associations (limit to 3)
    if (args.tagIds.length > 0) {
      const limitedTagIds = args.tagIds.slice(0, 3);
      await Promise.all(
        limitedTagIds.map(tagId =>
          context.entities.ItemTag.create({
            data: {
              itemId: args.id,
              tagId: tagId
            }
          })
        )
      );
    }
  }

  // Return updated item with relations
  return context.entities.Item.findUnique({
    where: { id: args.id },
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      activity: true
    }
  }) as Promise<Item>;
}

export const deleteItem: DeleteItem<{ id: number }, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Verify item belongs to user
  const existingItem = await context.entities.Item.findFirst({
    where: { 
      id: args.id, 
      userId: context.user.id 
    }
  });

  if (!existingItem) {
    throw new HttpError(404, 'Item not found');
  }

  // Delete the item (cascading delete will handle ItemTag relations)
  await context.entities.Item.delete({
    where: { id: args.id }
  });
}

export const updateItemRelevance: UpdateItemRelevance<{ id: number; relevance: number }, Item> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Validate relevance score (0.0 to 1.0)
  if (args.relevance < 0 || args.relevance > 1) {
    throw new HttpError(400, 'Relevance must be between 0.0 and 1.0');
  }

  // Verify item belongs to user
  const existingItem = await context.entities.Item.findFirst({
    where: { 
      id: args.id, 
      userId: context.user.id 
    }
  });

  if (!existingItem) {
    throw new HttpError(404, 'Item not found');
  }

  return context.entities.Item.update({
    where: { id: args.id },
    data: { 
      relevance: args.relevance,
      updatedAt: new Date()
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      activity: true
    }
  });
}

// ============================================================================
// ACTIVITY OPERATIONS (from queries.ts)
// ============================================================================

export const getActivities: GetActivities<void, Activity[]> = async (_args, context) => {
  return context.entities.Activity.findMany({
    where: {
      isDefault: true
    },
    orderBy: {
      name: 'asc'
    }
  })
}

// ============================================================================
// TAG OPERATIONS
// ============================================================================

export const getTags: GetTags<void, Tag[]> = async (_args, context) => {
  return context.entities.Tag.findMany({
    where: {
      userId: null // Global/default tags only
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ]
  })
}

type CreateTagInput = {
  name: string;
  category: string;
  color?: string;
}

export const createTag: CreateTag<CreateTagInput, Tag> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Check if tag already exists (global or user-specific)
  const existingTag = await context.entities.Tag.findFirst({
    where: {
      name: args.name,
      OR: [
        { userId: null }, // Global tag
        { userId: context.user.id } // User's tag
      ]
    }
  });

  if (existingTag) {
    throw new HttpError(400, 'Tag with this name already exists');
  }

  return context.entities.Tag.create({
    data: {
      name: args.name,
      category: args.category,
      color: args.color,
      userId: context.user.id // User-specific tag
    }
  });
}

// ============================================================================
// AI OPERATIONS
// ============================================================================

export const testAIConnection: TestAIConnection<void, any> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    const status = await aiService.testConnection();
    return {
      timestamp: new Date().toISOString(),
      ...status
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      connected: false,
      apiKeyConfigured: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

type TestTagSuggestionInput = {
  text: string;
}

export const testTagSuggestion: TestTagSuggestion<TestTagSuggestionInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    // Get available tags from database
    const availableTags = await context.entities.Tag.findMany({
      where: {
        userId: null // Global tags only
      },
      select: {
        name: true
      }
    });

    const tagNames = availableTags.map(tag => tag.name);
    const suggestedTags = await aiService.suggestTags(args.text, tagNames);

    return {
      timestamp: new Date().toISOString(),
      provider: aiService.getProvider(),
      input: args.text,
      availableTagCount: tagNames.length,
      suggestedTags: suggestedTags
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      provider: aiService.getProvider(),
      input: args.text,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestedTags: []
    };
  }
}

type TestAIProviderInput = {
  provider: 'huggingface' | 'openai' | 'google';
  text: string;
}

export const testAIProvider: TestAIProvider<TestAIProviderInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    // Test connection first
    const connectionStatus = await aiService.testConnectionWithProvider(args.provider);
    
    if (!connectionStatus.connected) {
      return {
        timestamp: new Date().toISOString(),
        provider: args.provider,
        input: args.text,
        connectionStatus,
        suggestedTags: [],
        error: connectionStatus.error || 'Provider not connected'
      };
    }

    // Get available tags from database
    const availableTags = await context.entities.Tag.findMany({
      where: {
        userId: null // Global tags only
      },
      select: {
        name: true
      }
    });

    const tagNames = availableTags.map(tag => tag.name);
    const result = await aiService.suggestTagsWithProvider(args.text, tagNames, args.provider);

    return {
      timestamp: new Date().toISOString(),
      provider: args.provider,
      input: args.text,
      availableTagCount: tagNames.length,
      connectionStatus,
      suggestedTags: result.tags,
      error: result.error
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      provider: args.provider,
      input: args.text,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestedTags: []
    };
  }
}

type CompareProvidersInput = {
  text: string;
}

export const compareProviders: CompareProviders<CompareProvidersInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    // Get available tags from database
    const availableTags = await context.entities.Tag.findMany({
      where: {
        userId: null // Global tags only
      },
      select: {
        name: true
      }
    });

    const tagNames = availableTags.map(tag => tag.name);

    // Test all three providers in parallel
    const [hfResult, openaiResult, googleResult] = await Promise.allSettled([
      aiService.suggestTagsWithProvider(args.text, tagNames, 'huggingface'),
      aiService.suggestTagsWithProvider(args.text, tagNames, 'openai'),
      aiService.suggestTagsWithProvider(args.text, tagNames, 'google')
    ]);

    return {
      timestamp: new Date().toISOString(),
      input: args.text,
      availableTagCount: tagNames.length,
      huggingface: {
        status: hfResult.status,
        tags: hfResult.status === 'fulfilled' ? hfResult.value.tags : [],
        error: hfResult.status === 'fulfilled' ? hfResult.value.error : hfResult.reason?.message
      },
      openai: {
        status: openaiResult.status,
        tags: openaiResult.status === 'fulfilled' ? openaiResult.value.tags : [],
        error: openaiResult.status === 'fulfilled' ? openaiResult.value.error : openaiResult.reason?.message
      },
      google: {
        status: googleResult.status,
        tags: googleResult.status === 'fulfilled' ? googleResult.value.tags : [],
        error: googleResult.status === 'fulfilled' ? googleResult.value.error : googleResult.reason?.message
      }
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      input: args.text,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

type SetAIProviderInput = {
  provider: 'huggingface' | 'openai' | 'google';
}

export const setAIProvider: SetAIProvider<SetAIProviderInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    // Test the provider before setting it
    const connectionStatus = await aiService.testConnectionWithProvider(args.provider);

    if (!connectionStatus.connected) {
      return {
        timestamp: new Date().toISOString(),
        success: false,
        provider: args.provider,
        error: connectionStatus.error || 'Provider not available'
      };
    }

    // Set the provider
    aiService.setProvider(args.provider);

    return {
      timestamp: new Date().toISOString(),
      success: true,
      provider: args.provider,
      previousProvider: aiService.getProvider(),
      message: `AI provider switched to ${args.provider}`
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      success: false,
      provider: args.provider,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

type TestGoogleAIInput = {
  text: string;
}

export const testGoogleAI: TestGoogleAI<TestGoogleAIInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    // Test Google AI connection first
    const connectionStatus = await aiService.testConnectionWithProvider('google');

    if (!connectionStatus.connected) {
      return {
        timestamp: new Date().toISOString(),
        provider: 'google',
        input: args.text,
        connectionStatus,
        suggestedTags: [],
        error: connectionStatus.error || 'Google AI not connected'
      };
    }

    // Get available tags from database
    const availableTags = await context.entities.Tag.findMany({
      where: {
        userId: null // Global tags only
      },
      select: {
        name: true
      }
    });

    const tagNames = availableTags.map(tag => tag.name);
    const result = await aiService.suggestTagsWithProvider(args.text, tagNames, 'google');

    return {
      timestamp: new Date().toISOString(),
      provider: 'google',
      input: args.text,
      availableTagCount: tagNames.length,
      connectionStatus,
      suggestedTags: result.tags,
      error: result.error
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      provider: 'google',
      input: args.text,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestedTags: []
    };
  }
}