const TOKEN_KEY = "jarvis.token";
const SESSION_TOKEN_KEY = "jarvis.sessionToken";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function storeToken(token: string, remember: boolean) {
  clearStoredToken();
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  }
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}
