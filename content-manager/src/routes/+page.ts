import registry from '$lib/data/accounts_registry.json';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    return {
        accounts: registry
    };
};
