export const helpfulChoices = { yes: 'Yes, it helped', somewhat: 'Somewhat', not_yet: 'Not yet', not_tried: 'I haven’t tried it yet' };
export const priceChoices = { worth_it: 'Worth the price', too_expensive: 'Too expensive for me', unsure: 'Not sure', free: 'It was free' };
export const validSlug = value => typeof value === 'string' && /^[a-z0-9-]{1,80}$/.test(value);
export const validId = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const wordCount = value => typeof value === 'string' ? (value.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length : 0;
export const thoughtfulComment = value => typeof value === 'string' && value.length <= 800 && wordCount(value) >= 7 && wordCount(value) <= 150;
export function feedbackInput(data) {
  if (!validSlug(data.slug) || !Object.hasOwn(helpfulChoices, data.helpful) || !Object.hasOwn(priceChoices, data.price)
    || !['public','private'].includes(data.visibility) || !thoughtfulComment(data.message)) return null;
  return { project_slug: data.slug, helpful: data.helpful, price: data.price, visibility: data.visibility, message: data.message.trim() };
}
export function threadAccess(memberId, authorId, ownerId) { return !!memberId && (memberId === authorId || memberId === ownerId); }
export function feedbackDestination(value) {
  if (['/','/dashboard/community','/dashboard/security','/dashboard/overview','/dashboard/preferences','/dashboard/notifications','/dashboard/privacy','/dashboard/help'].includes(value)) return value;
  if (value === 'listing' || value === '/?listing=settings') return '/?listing=settings';
  if (value === '/dashboard' || value === '/dashboard?view=creator' || value === '/dashboard/profile') return value;
  if(typeof value==='string' && /^\/projects\/[a-z0-9-]{1,80}$/.test(value))return value;
  if (typeof value === 'string' && /^\/tell\/[a-z0-9-]{1,80}$/.test(value)) return value;
  return '/?account=1';
}
