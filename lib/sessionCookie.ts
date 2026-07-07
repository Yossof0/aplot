export function sessionCookieName(chatId: string): string {
  return `servault_session_${chatId}`;
}
