import { supabase, getDefaultUser } from '../db.js';

export const automationTools = [
  {
    name: 'list_automations',
    description: 'List all automated comment-to-DM, story reply, and direct message keyword rules.',
    inputSchema: {
      type: 'object',
      properties: {
        triggerSource: { type: 'string', enum: ['all', 'comment', 'dm', 'story'] },
        activeOnly: { type: 'boolean', description: 'Filter only active automations' }
      }
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
        responseMessage: { type: 'string', description: 'The text message or payload sent to the user' },
        checkFollow: { type: 'boolean', description: 'Require user to follow your account before unlocking' },
        replyMode: { type: 'string', enum: ['dm_only', 'both', 'public_only'], description: 'For comment triggers' }
      },
      required: ['name', 'triggerSource', 'triggerValue', 'responseMessage']
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

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ count: data?.length || 0, automations: data || [] }, null, 2)
        }
      ]
    };
  }

  if (name === 'create_automation') {
    const triggerSource = args.triggerSource;
    const triggerType = args.triggerType || 'keyword';
    const content = {
      message: args.responseMessage,
      check_follow: args.checkFollow === true,
      reply_mode: args.replyMode || 'both'
    };

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
