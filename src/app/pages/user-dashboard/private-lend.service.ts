import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrivateLendService {
  constructor() {}

  // Öffnet das Standard-Mailprogramm mit dem JSON im Body (mailto)
  sendAsEmail(jsonText: string, to = '') {
    const subject = encodeURIComponent('Angebot: Private Gegenstände verleihen');
    const body = encodeURIComponent(jsonText);
    const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
    // Öffnet Mail-Client; Browser beschränkt Länge — für sehr große JSONs ggf. nicht geeignet
    window.location.href = mailto;
  }
}

