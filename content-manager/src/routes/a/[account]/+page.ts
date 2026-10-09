import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageLoad = async ({ params }) => {
	const account = params.account;

	try {
		const [snapshotRes, historyRes, strategyRes, postsDbRes] = await Promise.all([
			supabase
				.from('account_latest_snapshots')
				.select('*')
				.eq('account_id', account)
				.maybeSingle(),
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

		const snapshot = snapshotRes.data || {};
		const rawData = {
			profile_info: snapshot.profile_info || null,
			facebook_profile_info: snapshot.facebook_profile_info || null,
			account_insights: snapshot.account_insights || [],
			facebook_account_insights: snapshot.facebook_account_insights || [],
			media_posts: snapshot.media_posts || [],
			facebook_posts: snapshot.facebook_posts || [],
			media_insights: snapshot.media_insights || {},
			historical_stats: historyRes.data || []
		};

		const bullseyeData = strategyRes.data?.bullseye_data || { rings: [] };
		const postAnalysisData = strategyRes.data?.post_analysis_data || {};
		const postsData = (postsDbRes.data || []).map((p) => ({
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
