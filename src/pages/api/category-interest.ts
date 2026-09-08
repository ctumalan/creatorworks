import type { APIRoute } from 'astro';
import { memberContext } from '../../server/workspace';
import { json, origin } from '../../server/auth';
import { sameOrigin } from '../../server/security.mjs';
import { allowRequest } from '../../server/abuse';

export const POST: APIRoute = async context => {
  if (!sameOrigin(context.request, origin(context))) return json({error:'Request not allowed.'},403);
  try {
    const m=await memberContext(context);if(!m)return json({error:'Sign in required.'},401);
    if(!await allowRequest(m.user.id,'category-interest',120))return json({error:'Please wait.'},429);
    const raw=await context.request.text();if(raw.length>1000)return json({error:'Too large.'},413);
    const category=String(JSON.parse(raw).category||'').trim();
    if(!/^[\p{L}\p{N}][\p{L}\p{N} &'’+/-]{1,47}$/u.test(category)||category==='All')return json({error:'Invalid category.'},400);
    const result=await m.db.rpc('cw_record_category_interest',{p_user:m.member.id,p_category:category});
    if(result.error)throw result.error;
    return json({saved:true});
  } catch { return json({error:'Category activity could not be saved.'},503); }
};
