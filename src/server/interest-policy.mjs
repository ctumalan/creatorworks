import { wishCategories } from './wish-policy.mjs';
export function selectedInterests(values) {
 if (!Array.isArray(values) || values.length > wishCategories.length || values.some(value => !wishCategories.includes(value))) return null;
 return [...new Set(values)];
}
export function recommendationInterests(preferences) {
 return [...new Set([...(preferences?.selected_interests || []), ...(preferences?.personalization === false ? [] : preferences?.interests || [])])];
}
