import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const account = params.account;
    
    try {
        const [postsRes, analyticsRawRes, bullseyeRes, postAnalysisRes] = await Promise.all([
            import(`../../../lib/data/accounts/${account}/posts.json`).catch(() => ({ default: [] })),
            import(`../../../lib/data/accounts/${account}/analytics_raw.json`).catch(() => ({ default: [] })),
            import(`../../../lib/data/accounts/${account}/bullseye_analysis.json`).catch(() => ({ default: {} })),
            import(`../../../lib/data/accounts/${account}/post_analysis.json`).catch(() => ({ default: {} }))
        ]);

        return {
            account,
            postsData: postsRes.default,
            rawData: analyticsRawRes.default,
            bullseyeData: bullseyeRes.default,
            postAnalysisData: postAnalysisRes.default
        };
    } catch (e) {
        throw error(404, 'Account data not found');
    }
};
