export const audioSrc = (cardId: string) => `/audio/cards/${encodeURIComponent(cardId)}.mp3`;

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function speak(text: string, cardId?: string): void {
  if (canSpeak()) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return;
  }
  if (cardId && typeof Audio !== 'undefined') new Audio(audioSrc(cardId)).play().catch(() => {});
}
