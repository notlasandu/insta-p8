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

		let postsData = postsRes.default || [];
		const rawData = { ...(analyticsRawRes.default || {}) };
		let bullseyeData = bullseyeRes.default || {};
		let postAnalysisData = postAnalysisRes.default || {};

		try {
			const [historyRes, strategyRes, postsDbRes] = await Promise.all([
				supabase
					.from('account_daily_analytics')
					.select('date, reach, engaged, views, clicks, followers, instagram, facebook, combined')
					.eq('account_id', account)
					.order('date', { ascending: true }),
				supabase
					.from('account_strategy')
					.select('bullseye_data, post_analysis_data')
					.eq('account_id', account)
					.maybeSingle(),
				supabase
					.from('content_posts')
					.select('*')
					.eq('account_id', account)
					.order('created_at', { ascending: false })
			]);

			if (historyRes.data && historyRes.data.length > 0) {
				rawData.historical_stats = historyRes.data;
			}

			if (strategyRes.data?.bullseye_data && Object.keys(strategyRes.data.bullseye_data).length > 0) {
				bullseyeData = strategyRes.data.bullseye_data;
			}

			if (strategyRes.data?.post_analysis_data && Object.keys(strategyRes.data.post_analysis_data).length > 0) {
				postAnalysisData = strategyRes.data.post_analysis_data;
			}

			if (postsDbRes.data && postsDbRes.data.length > 0) {
				postsData = postsDbRes.data.map((p) => ({
					id: p.id,
					title: p.title,
					status: p.status,
					scheduledDate: p.scheduled_date,
					description: p.description,
					likes: p.likes ?? 0,
					comments: p.comments ?? 0,
					shares: p.shares ?? 0,
					thumbnail: p.thumbnail ?? ''
				}));
			}
		} catch (dbErr) {
			console.warn('Supabase data load error:', dbErr);
		}

		return {
			account,
			postsData,
			rawData,
			bullseyeData,
			postAnalysisData
		};
	} catch (e) {
		throw error(404, 'Account data not found');
	}
};
