import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageLoad = async ({ params }) => {
    const account = params.account;
    
    try {
        const [postsRes, analyticsRawRes, bullseyeRes, postAnalysisRes] = await Promise.all([
            import(`../../../lib/data/accounts/${account}/posts.json`).catch(() => ({ default: [] })),
            import(`../../../lib/data/accounts/${account}/analytics_raw.json`).catch(() => ({ default: {} })),
            import(`../../../lib/data/accounts/${account}/bullseye_analysis.json`).catch(() => ({ default: {} })),
            import(`../../../lib/data/accounts/${account}/post_analysis.json`).catch(() => ({ default: {} }))
        ]);

        const rawData = { ...(analyticsRawRes.default || {}) };

        try {
            const { data: dbStats } = await supabase
                .from('account_daily_analytics')
                .select('date, reach, engaged, views, clicks, followers, instagram, facebook, combined')
                .eq('account_id', account)
                .order('date', { ascending: true });

            if (dbStats && dbStats.length > 0) {
                rawData.historical_stats = dbStats;
            }
        } catch (_) {}

        return {
            account,
            postsData: postsRes.default,
            rawData,
            bullseyeData: bullseyeRes.default,
            postAnalysisData: postAnalysisRes.default
        };
    } catch (e) {
        throw error(404, 'Account data not found');
    }
};
