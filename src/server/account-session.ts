import type { APIContext } from 'astro';
import { currentUser, env, SESSION_COOKIE, workos } from './auth';
export async function accountSession(context: APIContext) {
 const user = await currentUser(context);
 if (!user) return null;
 const data = context.cookies.get(SESSION_COOKIE)?.value;
 if (!data) return null;
 const result = await workos().userManagement.loadSealedSession({sessionData:data,cookiePassword:env('WORKOS_COOKIE_PASSWORD')}).authenticate();
 if (!result.authenticated || result.user.id !== user.id || result.impersonator) return null;
 return result;
}
