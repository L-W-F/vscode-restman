import { Cookie, CookieJar } from 'tough-cookie';

const store = new CookieJar();

export const cookieStore = {
  get: (url: string) => {
    return store.getCookieStringSync(url);
  },
  set: (url: string, cookieHeader?: string | string[]) => {
    if (typeof cookieHeader === 'string') {
      cookieHeader = [cookieHeader];
    }

    if (Array.isArray(cookieHeader)) {
      cookieHeader.forEach((cookie) => {
        const parsed = Cookie.parse(cookie);

        if (parsed) {
          store.setCookieSync(parsed, url);
        }
      });
    }
  },
};
