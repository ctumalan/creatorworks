import { createHmac } from 'node:crypto';
import { database } from './database';
import { env } from './auth';
export async function allowRequest(identifier: string, action: string, limit = 20, seconds = 60) {
 const key = createHmac('sha256', env('WORKOS_COOKIE_PASSWORD')).update(action + ':' + identifier).digest('hex');
 const {data,error} = await database().rpc('cw_rate_limit',{p_key:key,p_limit:limit,p_seconds:seconds});
 if (error) throw new Error('Request protection unavailable');
 return data === true;
}
