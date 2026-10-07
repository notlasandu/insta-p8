import { supabase, getDefaultUser } from '../db.js';
export const inboxTools = [
    {
        name: 'list_conversations',
        description: 'List active direct message conversations across Instagram Direct and Facebook Messenger.',
        inputSchema: {
            type: 'object',
            properties: {
                platform: { type: 'string', enum: ['all', 'instagram', 'facebook'], description: 'Platform filter' },
                limit: { type: 'number', description: 'Max conversations to retrieve (default: 20, max: 100)' }
            }
        }
    },
    {
        name: 'get_conversation_messages',
        description: 'Get full message thread history for a specific conversation ID.',
        inputSchema: {
            type: 'object',
            properties: {
                conversationId: { type: 'string', description: 'UUID of the conversation' },
                limit: { type: 'number', description: 'Max messages to return (default: 50)' }
            },
            required: ['conversationId']
        }
    },
    {
        name: 'send_direct_message',
        description: 'Send a direct message reply to an Instagram or Facebook contact.',
        inputSchema: {
            type: 'object',
            properties: {
                conversationId: { type: 'string', description: 'Conversation UUID in database' },
                message: { type: 'string', description: 'Message copy to send (max 1000 characters)' }
            },
            required: ['conversationId', 'message']
        }
    },
    {
        name: 'search_inbox',
        description: 'Search messages across threads for customer objections, questions, feedback, or keywords.',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Keyword or phrase to search for' },
                platform: { type: 'string', enum: ['all', 'instagram', 'facebook'] },
                limit: { type: 'number', description: 'Max matching messages to return (default: 30)' }
            },
            required: ['query']
        }
    },
    {
        name: 'list_post_comments',
        description: 'List recent comments on Instagram and Facebook posts/reels.',
        inputSchema: {
            type: 'object',
            properties: {
                platform: { type: 'string', enum: ['all', 'instagram', 'facebook'] },
                postId: { type: 'string', description: 'Filter by specific post ID' },
                limit: { type: 'number', description: 'Max comments to return (default: 30)' }
            }
        }
    },
    {
        name: 'reply_to_comment',
        description: 'Post a public reply to a comment on an Instagram or Facebook post.',
        inputSchema: {
            type: 'object',
            properties: {
                commentId: { type: 'string', description: 'ID of the comment to reply to' },
                message: { type: 'string', description: 'Reply text (max 300 characters)' }
            },
            required: ['commentId', 'message']
        }
    }
];
export async function handleInboxTools(name, args) {
    const user = await getDefaultUser();
    if (!user)
        throw new Error('No active user or access token found in database.');
    if (name === 'list_conversations') {
        const limit = Math.min(Number(args?.limit) || 20, 100);
        let query = supabase
            .from('conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('last_message_at', { ascending: false })
            .limit(limit);
        if (args?.platform && args.platform !== 'all') {
            query = query.eq('platform', args.platform);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ count: data?.length || 0, conversations: data || [] }, null, 2)
                }
            ]
        };
    }
    if (name === 'get_conversation_messages') {
        const limit = Math.min(Number(args?.limit) || 50, 100);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', args.conversationId)
            .order('created_at', { ascending: true })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ count: data?.length || 0, messages: data || [] }, null, 2)
                }
            ]
        };
    }
    if (name === 'send_direct_message') {
        const messageText = (args?.message || '').trim();
        if (!messageText)
            throw new Error('Guardrail: Message body cannot be empty.');
        if (messageText.length > 1000)
            throw new Error('Guardrail: Message exceeds maximum limit of 1000 characters.');
        const { data: conv, error: convErr } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', args.conversationId)
            .single();
        if (convErr || !conv)
            throw new Error(`Conversation not found for ID: ${args.conversationId}`);
        const recipientId = conv.recipient_id;
        const isFb = conv.platform === 'facebook';
        const sendRes = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(user.access_token)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: messageText }
            })
        });
        const sendJson = await sendRes.json();
        if (!sendRes.ok || sendJson.error) {
            throw new Error(`Meta API Delivery Failed: ${JSON.stringify(sendJson.error || sendJson)}`);
        }
        const msgId = sendJson.message_id || `mid_${Date.now()}`;
        await supabase.from('messages').insert({
            id: msgId,
            conversation_id: conv.id,
            user_id: user.id,
            sender_id: user.page_id || String(user.id),
            sender_username: user.username,
            content: messageText,
            platform: conv.platform,
            sender_type: 'user',
            is_from_instagram: !isFb,
            created_at: new Date().toISOString()
        });
        await supabase.from('conversations').update({
            last_message_at: new Date().toISOString(),
            last_message_snippet: messageText.slice(0, 150)
        }).eq('id', conv.id);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ success: true, message_id: msgId, recipient: conv.recipient_username, platform: conv.platform })
                }
            ]
        };
    }
    if (name === 'search_inbox') {
        const queryStr = (args?.query || '').trim();
        if (queryStr.length < 2)
            throw new Error('Guardrail: Search query must be at least 2 characters.');
        const limit = Math.min(Number(args?.limit) || 30, 100);
        let query = supabase
            .from('messages')
            .select('id, conversation_id, sender_username, sender_type, content, platform, created_at')
            .ilike('content', `%${queryStr}%`)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (args?.platform && args.platform !== 'all') {
            query = query.eq('platform', args.platform);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ query: queryStr, matches_count: data?.length || 0, messages: data || [] }, null, 2)
                }
            ]
        };
    }
    if (name === 'list_post_comments') {
        const limit = Math.min(Number(args?.limit) || 30, 100);
        let query = supabase
            .from('post_comments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (args?.platform && args.platform !== 'all') {
            query = query.eq('platform', args.platform);
        }
        if (args?.postId) {
            query = query.eq('post_id', args.postId);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ count: data?.length || 0, comments: data || [] }, null, 2)
                }
            ]
        };
    }
    if (name === 'reply_to_comment') {
        const replyText = (args?.message || '').trim();
        if (!replyText)
            throw new Error('Guardrail: Reply cannot be empty.');
        if (replyText.length > 300)
            throw new Error('Guardrail: Comment reply exceeds 300 character limit.');
        const { data: parentComment } = await supabase
            .from('post_comments')
            .select('*')
            .eq('id', args.commentId)
            .maybeSingle();
        const isFb = parentComment?.platform === 'facebook';
        const endpoint = isFb ? `${args.commentId}/comments` : `${args.commentId}/replies`;
        const res = await fetch(`https://graph.facebook.com/v21.0/${endpoint}?access_token=${encodeURIComponent(user.access_token)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: replyText })
        });
        const json = await res.json();
        if (!res.ok || json.error) {
            throw new Error(`Meta API Comment Reply Failed: ${JSON.stringify(json.error || json)}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ success: true, reply_id: json.id, comment_id: args.commentId })
                }
            ]
        };
    }
    throw new Error(`Unknown inbox tool: ${name}`);
}
