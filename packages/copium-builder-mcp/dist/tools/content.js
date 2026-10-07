import { supabase } from '../db.js';
export const contentTools = [
    {
        name: 'list_content_pipeline',
        description: 'List all content posts in the pipeline (ideas, drafts, ready, posted) with metrics and captions.',
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Account identifier (default: berl_view)' },
                status: { type: 'string', enum: ['ALL', 'IDEA', 'DRAFT', 'READY', 'POSTED'] }
            }
        }
    },
    {
        name: 'create_or_update_content_post',
        description: 'Add a new post idea/draft or update an existing post in the content pipeline.',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Unique post ID (generated if not provided)' },
                accountId: { type: 'string', description: 'Account ID (default: berl_view)' },
                title: { type: 'string', description: 'Post hook / working title' },
                status: { type: 'string', enum: ['IDEA', 'DRAFT', 'READY', 'POSTED'] },
                description: { type: 'string', description: 'Script, outline, or caption copy' },
                scheduledDate: { type: 'string', description: 'ISO date string' },
                thumbnail: { type: 'string', description: 'Thumbnail URL' }
            },
            required: ['title']
        }
    },
    {
        name: 'delete_content_post',
        description: 'Remove a post from the content pipeline.',
        inputSchema: {
            type: 'object',
            properties: {
                postId: { type: 'string', description: 'ID of the post to delete' }
            },
            required: ['postId']
        }
    },
    {
        name: 'get_topic_bullseye',
        description: 'Fetch the 5-Ring Topic Bullseye audience targeting model (Ring 1 Ideal Viewer -> Ring 5 Broad).',
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Account ID (default: berl_view)' }
            }
        }
    },
    {
        name: 'update_topic_bullseye',
        description: 'Update the 5-Ring Topic Bullseye audience descriptions and mapped post IDs.',
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Account ID (default: berl_view)' },
                rings: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            ring: { type: 'number' },
                            audience: { type: 'string' },
                            post_ids: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['ring', 'audience']
                    }
                }
            },
            required: ['rings']
        }
    },
    {
        name: 'get_post_analysis',
        description: 'Get deep content performance learnings, top hooks, and conversion takeaways.',
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Account ID (default: berl_view)' }
            }
        }
    },
    {
        name: 'update_post_analysis',
        description: 'Save new content takeaways, key learnings, or format metrics.',
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Account ID (default: berl_view)' },
                summary: {
                    type: 'object',
                    properties: {
                        total_reach: { type: 'number' },
                        top_performing_format: { type: 'string' },
                        avg_engagement_rate: { type: 'number' },
                        key_learnings: { type: 'array', items: { type: 'string' } }
                    }
                }
            },
            required: ['summary']
        }
    }
];
export async function handleContentTools(name, args) {
    const accountId = args?.accountId || 'berl_view';
    if (name === 'list_content_pipeline') {
        let query = supabase
            .from('content_posts')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });
        if (args?.status && args.status !== 'ALL') {
            query = query.eq('status', args.status);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ count: data?.length || 0, posts: data || [] }, null, 2)
                }
            ]
        };
    }
    if (name === 'create_or_update_content_post') {
        const postId = args.id || `post_${Date.now()}`;
        const payload = {
            id: postId,
            account_id: accountId,
            title: args.title,
            status: args.status || 'DRAFT',
            updated_at: new Date().toISOString()
        };
        if (args.description !== undefined)
            payload.description = args.description;
        if (args.scheduledDate !== undefined)
            payload.scheduled_date = args.scheduledDate;
        if (args.thumbnail !== undefined)
            payload.thumbnail = args.thumbnail;
        const { data, error } = await supabase
            .from('content_posts')
            .upsert(payload)
            .select('*')
            .single();
        if (error)
            throw new Error(`Failed to save content post: ${error.message}`);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ success: true, post: data }, null, 2)
                }
            ]
        };
    }
    if (name === 'delete_content_post') {
        const { error } = await supabase
            .from('content_posts')
            .delete()
            .eq('id', args.postId)
            .eq('account_id', accountId);
        if (error)
            throw new Error(`Failed to delete post: ${error.message}`);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ success: true, deleted_id: args.postId })
                }
            ]
        };
    }
    if (name === 'get_topic_bullseye') {
        const { data, error } = await supabase
            .from('account_strategy')
            .select('bullseye_data')
            .eq('account_id', accountId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(data?.bullseye_data || { rings: [] }, null, 2)
                }
            ]
        };
    }
    if (name === 'update_topic_bullseye') {
        const { data, error } = await supabase
            .from('account_strategy')
            .upsert({
            account_id: accountId,
            bullseye_data: { rings: args.rings },
            updated_at: new Date().toISOString()
        })
            .select('*')
            .single();
        if (error)
            throw new Error(`Failed to update bullseye: ${error.message}`);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ success: true, bullseye: data?.bullseye_data }, null, 2)
                }
            ]
        };
    }
    if (name === 'get_post_analysis') {
        const { data, error } = await supabase
            .from('account_strategy')
            .select('post_analysis_data')
            .eq('account_id', accountId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(data?.post_analysis_data || {}, null, 2)
                }
            ]
        };
    }
    if (name === 'update_post_analysis') {
        const { data, error } = await supabase
            .from('account_strategy')
            .upsert({
            account_id: accountId,
            post_analysis_data: { summary: args.summary },
            updated_at: new Date().toISOString()
        })
            .select('*')
            .single();
        if (error)
            throw new Error(`Failed to update post analysis: ${error.message}`);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ success: true, post_analysis: data?.post_analysis_data }, null, 2)
                }
            ]
        };
    }
    throw new Error(`Unknown content tool: ${name}`);
}
