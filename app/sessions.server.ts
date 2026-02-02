import { createCookieSessionStorage, redirect } from "react-router";

type User = { id: string; username: string; password: string };

export const {getSession, commitSession, destroySession} = createCookieSessionStorage({
    cookie: {
        name: '__session',
        secrets: ['s3cret'],
        sameSite : "lax",
        path : '/',
        httpOnly : true
    }

})

export async function logout(request:Request){
    const session = await getSession(request.headers.get('Cookie'))
    return redirect('/', {
        headers: {
            'Set-Cookie' : await destroySession(session)
        }
    })
}

const USER_SESSION_KEY = 'userId'

export async function getUserId(
    request:Request
    ) : Promise<User['id'] | undefined>{
    const session = await getSession(request.headers.get('Cookie'));
    const userId = session.get(USER_SESSION_KEY);
    return userId;
}

export async function createUserSession({
    request,
    userId,
    remember,
    redirectUrl
}: {
    request: Request,
    userId: number,
    remember: boolean,
    redirectUrl? : string
}){
    const session = await getSession(request.headers.get('Cookie'));
    session.set(USER_SESSION_KEY, userId)
    return redirect('/', {
        headers: {
            'Set-Cookie' : await commitSession(session, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: remember ? 60 * 60 * 24 : undefined
            })
        }
    })

}
