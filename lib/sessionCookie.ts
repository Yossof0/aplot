export function sessionCookieName(chatId: string): string {
  return `aplot_session_${chatId}`;
}
