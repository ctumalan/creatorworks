import type {APIRoute} from 'astro';
import {validId} from '../../../server/feedback-policy.mjs';
export const GET:APIRoute=context=>validId(context.params.id)?context.redirect('/dashboard/messages?thread='+context.params.id+(context.url.searchParams.has('sent')?'&sent=1':context.url.searchParams.has('error')?'&error=save':''),302):new Response('Conversation not found',{status:404});
