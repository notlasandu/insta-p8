import { supabase, getDefaultUser } from '../db.js';

export const automationTools = [
  {
    name: 'list_automations',
    description: 'List all automated comment-to-DM, story reply, and direct message keyword rules with full details including response_content (message, link_url, link_title, reply_mode, public_replies, check_follow), specific_media_id, and active status.',
    inputSchema: {
      type: 'object',
      properties: {
        triggerSource: { type: 'string', enum: ['all', 'comment', 'dm', 'story'] },
        activeOnly: { type: 'boolean', description: 'Filter only active automations' },
        search: { type: 'string', description: 'Optional case-insensitive filter matching automation name, trigger keywords, or link URL' }
      }
    }
  },
  {
    name: 'get_automation',
    description: 'Get full details of a single automation rule by its UUID, including response_content (message, link_url, link_title, public_replies, reply_mode) and media targeting.',
    inputSchema: {
      type: 'object',
      properties: {
        automationId: { type: 'string', description: 'UUID of the automation' }
      },
      required: ['automationId']
    }
  },
  {
    name: 'create_automation',
    description: 'Create a new automated reply workflow for post comments, direct messages, or stories.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Descriptive title of the automation' },
        triggerSource: { type: 'string', enum: ['comment', 'dm', 'story'], description: 'Trigger origin' },
        triggerType: { type: 'string', enum: ['keyword', 'reply_all'], description: 'Match type' },
        triggerValue: { type: 'string', description: 'Comma-separated trigger keywords (e.g. "price, details")' },
        responseMessage: { type: 'string', description: 'The text message sent to the user (Meta limit: max 1000 chars for regular text, max 640 chars if linkUrl is attached)' },
        linkUrl: { type: 'string', description: 'Optional destination URL to attach as a native Instagram message CTA button (e.g. https://...)' },
        linkTitle: { type: 'string', description: 'Optional button label (max 20 chars, default: "Open Guide")' },
        publicReplies: { type: 'array', items: { type: 'string' }, description: 'Optional rotation of public comment replies (defaults to 4 human-like phrases)' },
        checkFollow: { type: 'boolean', description: 'Require user to follow your account before unlocking' },
        replyMode: { type: 'string', enum: ['dm_only', 'both', 'public_only'], description: 'For comment triggers' }
      },
      required: ['name', 'triggerSource', 'triggerValue', 'responseMessage']
    }
  },
  {
    name: 'update_automation',
    description: 'Edit an existing automation rule. Supports partial updates — pass only the fields you want to change (e.g. linkUrl, linkTitle, responseMessage, triggerValue, name, publicReplies, replyMode, checkFollow, specificMediaId, isActive). Pass an empty string "" for linkUrl to remove the CTA button.',
    inputSchema: {
      type: 'object',
      properties: {
        automationId: { type: 'string', description: 'UUID of the automation to update' },
        name: { type: 'string', description: 'Updated descriptive title of the automation' },
        triggerSource: { type: 'string', enum: ['comment', 'dm', 'story'], description: 'Updated trigger origin' },
        triggerType: { type: 'string', enum: ['keyword', 'reply_all'], description: 'Updated match type' },
        triggerValue: { type: 'string', description: 'Updated comma-separated trigger keywords' },
        responseMessage: { type: 'string', description: 'Updated DM text message (Meta limit: max 1000 chars, or max 640 chars if linkUrl is attached)' },
        linkUrl: { type: 'string', description: 'Updated CTA button URL (must start with http:// or https://), or "" to remove the link button' },
        linkTitle: { type: 'string', description: 'Updated CTA button label (max 20 chars)' },
        publicReplies: { type: 'array', items: { type: 'string' }, description: 'Updated rotation of public comment replies' },
        checkFollow: { type: 'boolean', description: 'Require user to follow your account before unlocking' },
        replyMode: { type: 'string', enum: ['dm_only', 'both', 'public_only'], description: 'For comment triggers' },
        specificMediaId: { type: 'string', description: 'Comma-separated Instagram media IDs to target, or "" to target all posts' },
        isActive: { type: 'boolean', description: 'Activate or pause the automation' }
      },
      required: ['automationId']
    }
  },
  {
    name: 'toggle_automation',
    description: 'Activate or pause an existing automation rule.',
    inputSchema: {
      type: 'object',
      properties: {
        automationId: { type: 'string', description: 'UUID of the automation' },
        isActive: { type: 'boolean', description: 'True to activate, False to pause' }
      },
      required: ['automationId', 'isActive']
    }
  },
  {
    name: 'delete_automation',
    description: 'Permanently remove an automation rule.',
    inputSchema: {
      type: 'object',
      properties: {
        automationId: { type: 'string', description: 'UUID of the automation to delete' }
      },
      required: ['automationId']
    }
  },
  {
    name: 'get_assistant_settings',
    description: 'Get current AI Assistant configuration (Groq auto-reply toggle, system context, model).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'update_assistant_settings',
    description: 'Update the AI Assistant system prompt context or enable/disable automatic Groq DM replies.',
    inputSchema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', description: 'Toggle AI auto-reply on or off' },
        contextPrompt: { type: 'string', description: 'System context prompt defining tone, business background, and rules' }
      }
    }
  },
  {
    name: 'list_ice_breakers',
    description: 'List Instagram FAQ ice-breaker prompt questions shown to new visitors opening DMs.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'create_ice_breaker',
    description: 'Create an ice-breaker question and automated response.',
    inputSchema: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'Question text (max 80 chars)' },
        response: { type: 'string', description: 'Instant answer message' }
      },
      required: ['question', 'response']
    }
  },
  {
    name: 'delete_ice_breaker',
    description: 'Delete an ice-breaker question.',
    inputSchema: {
      type: 'object',
      properties: {
        iceBreakerId: { type: 'string', description: 'UUID of the ice breaker' }
      },
      required: ['iceBreakerId']
    }
  }
];

function validateMetaResponseLimits(message: string, linkUrl?: string, linkTitle?: string) {
  if (!message) {
    throw new Error('Guardrail: responseMessage cannot be empty.');
  }
  if (linkUrl) {
    if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
      throw new Error('Guardrail: linkUrl must be a valid URL starting with http:// or https://');
    }
    if (message.length > 640) {
      throw new Error(`Guardrail: Message length (${message.length} chars) exceeds Meta's 640 character limit for Button Templates. Please shorten your message.`);
    }
    if (linkTitle && linkTitle.length > 20) {
      throw new Error(`Guardrail: Button label '${linkTitle}' exceeds Meta's 20 character limit (current: ${linkTitle.length} chars).`);
    }
  } else if (message.length > 1000) {
    throw new Error(`Guardrail: Message length (${message.length} chars) exceeds Meta's 1000 character limit for direct messages.`);
  }
}

export async function handleAutomationTools(name: string, args: any) {
  const user = await getDefaultUser();
  if (!user) throw new Error('No active user found in database.');

  if (name === 'list_automations') {
    let query = supabase
      .from('automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (args?.triggerSource && args.triggerSource !== 'all') {
      query = query.eq('trigger_source', args.triggerSource);
    }
    if (args?.activeOnly === true) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let results = data || [];
    if (args?.search && String(args.search).trim()) {
      const needle = String(args.search).trim().toLowerCase();
      results = results.filter((row: any) => {
        const nameMatch = String(row.name || '').toLowerCase().includes(needle);
        const triggerMatch = String(row.trigger_value || '').toLowerCase().includes(needle);
        const linkMatch = String(row.response_content?.link_url || '').toLowerCase().includes(needle);
        return nameMatch || triggerMatch || linkMatch;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ count: results.length, automations: results }, null, 2)
        }
      ]
    };
  }

  if (name === 'get_automation') {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', args.automationId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      throw new Error(`Automation not found: ${error?.message || args.automationId}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ automation: data }, null, 2)
        }
      ]
    };
  }

  if (name === 'create_automation') {
    const triggerSource = args.triggerSource;
    const triggerType = args.triggerType || 'keyword';
    const message = (args.responseMessage || '').trim();
    const linkUrl = args.linkUrl ? String(args.linkUrl).trim() : undefined;
    const rawLinkTitle = args.linkTitle !== undefined ? String(args.linkTitle).trim() : undefined;

    validateMetaResponseLimits(message, linkUrl, rawLinkTitle);

    const linkTitle = (rawLinkTitle || 'Open Guide').slice(0, 20);

    const defaultPublicReplies = [
      'sent you a dm',
      'just sent. check your inbox',
      'check your inbox now',
      "check your dm's"
    ];

    const publicReplies = Array.isArray(args.publicReplies) && args.publicReplies.length > 0
      ? args.publicReplies
      : defaultPublicReplies;

    const content: any = {
      message,
      check_follow: args.checkFollow === true,
      reply_mode: args.replyMode || 'both',
      public_replies: publicReplies
    };

    if (linkUrl) {
      content.link_url = linkUrl;
      content.link_title = linkTitle;
    }

    const { data, error } = await supabase
      .from('automations')
      .insert({
        user_id: user.id,
        name: args.name,
        trigger_source: triggerSource,
        trigger_type: triggerType,
        trigger_value: args.triggerValue,
        response_type: 'pro',
        response_content: content,
        is_active: true
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create automation: ${error.message}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, automation: data }, null, 2)
        }
      ]
    };
  }

  if (name === 'update_automation') {
    const { data: existing, error: fetchError } = await supabase
      .from('automations')
      .select('*')
      .eq('id', args.automationId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existing) {
      throw new Error(`Automation not found: ${fetchError?.message || args.automationId}`);
    }

    const mergedContent: any = { ...(existing.response_content || {}) };

    if (args.responseMessage !== undefined) {
      mergedContent.message = String(args.responseMessage).trim();
    }
    if (args.linkUrl !== undefined) {
      const trimmedUrl = args.linkUrl === null ? '' : String(args.linkUrl).trim();
      if (!trimmedUrl) {
        delete mergedContent.link_url;
        delete mergedContent.link_title;
      } else {
        mergedContent.link_url = trimmedUrl;
        if (!mergedContent.link_title && args.linkTitle === undefined) {
          mergedContent.link_title = 'Open Guide';
        }
      }
    }
    if (args.linkTitle !== undefined) {
      const trimmedTitle = String(args.linkTitle).trim();
      if (trimmedTitle) {
        mergedContent.link_title = trimmedTitle;
      } else {
        delete mergedContent.link_title;
      }
    }
    if (args.publicReplies !== undefined) {
      if (!Array.isArray(args.publicReplies)) {
        throw new Error('Guardrail: publicReplies must be an array of strings.');
      }
      mergedContent.public_replies = args.publicReplies;
    }
    if (args.checkFollow !== undefined) {
      mergedContent.check_follow = Boolean(args.checkFollow);
    }
    if (args.replyMode !== undefined) {
      mergedContent.reply_mode = args.replyMode;
    }

    validateMetaResponseLimits(
      String(mergedContent.message || ''),
      mergedContent.link_url,
      mergedContent.link_title
    );

    const updatePayload: any = {
      response_content: mergedContent,
      updated_at: new Date().toISOString()
    };

    if (args.name !== undefined) updatePayload.name = String(args.name).trim();
    if (args.triggerSource !== undefined) updatePayload.trigger_source = args.triggerSource;
    if (args.triggerType !== undefined) updatePayload.trigger_type = args.triggerType;
    if (args.triggerValue !== undefined) updatePayload.trigger_value = String(args.triggerValue).toLowerCase();
    if (args.isActive !== undefined) updatePayload.is_active = Boolean(args.isActive);
    if (args.checkFollow !== undefined) updatePayload.check_follow = Boolean(args.checkFollow);
    if (args.specificMediaId !== undefined) {
      const trimmedMedia = args.specificMediaId === null ? '' : String(args.specificMediaId).trim();
      updatePayload.specific_media_id = trimmedMedia || null;
    }

    const { data, error } = await supabase
      .from('automations')
      .update(updatePayload)
      .eq('id', args.automationId)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update automation: ${error.message}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, automation: data }, null, 2)
        }
      ]
    };
  }

  if (name === 'toggle_automation') {
    const { data, error } = await supabase
      .from('automations')
      .update({ is_active: Boolean(args.isActive), updated_at: new Date().toISOString() })
      .eq('id', args.automationId)
      .eq('user_id', user.id)
      .select('id, name, is_active')
      .single();

    if (error) throw new Error(`Failed to toggle automation: ${error.message}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, updated: data })
        }
      ]
    };
  }

  if (name === 'delete_automation') {
    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', args.automationId)
      .eq('user_id', user.id);

    if (error) throw new Error(`Failed to delete automation: ${error.message}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, deleted_id: args.automationId })
        }
      ]
    };
  }

  if (name === 'get_assistant_settings') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            groq_auto_reply_enabled: user.groq_auto_reply_enabled ?? false,
            ai_context: user.ai_context ?? '',
            ai_model: user.ai_model ?? 'llama-3.3-70b-versatile',
            ai_base_url: user.ai_base_url ?? 'https://api.groq.com/openai/v1'
          }, null, 2)
        }
      ]
    };
  }

  if (name === 'update_assistant_settings') {
    const updatePayload: any = {};
    if (typeof args?.enabled === 'boolean') updatePayload.groq_auto_reply_enabled = args.enabled;
    if (typeof args?.contextPrompt === 'string') updatePayload.ai_context = args.contextPrompt;

    const { error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', user.id);

    if (error) throw new Error(`Failed to update assistant settings: ${error.message}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, updated_settings: updatePayload })
        }
      ]
    };
  }

  if (name === 'list_ice_breakers') {
    const { data, error } = await supabase
      .from('ice_breakers')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ count: data?.length || 0, ice_breakers: data || [] }, null, 2)
        }
      ]
    };
  }

  if (name === 'create_ice_breaker') {
    const { data, error } = await supabase
      .from('ice_breakers')
      .insert({
        user_id: user.id,
        question: args.question.slice(0, 80),
        response: args.response
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create ice breaker: ${error.message}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, ice_breaker: data })
        }
      ]
    };
  }

  if (name === 'delete_ice_breaker') {
    const { error } = await supabase
      .from('ice_breakers')
      .delete()
      .eq('id', args.iceBreakerId)
      .eq('user_id', user.id);

    if (error) throw new Error(`Failed to delete ice breaker: ${error.message}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, deleted_id: args.iceBreakerId })
        }
      ]
    };
  }

  throw new Error(`Unknown automation tool: ${name}`);
}
