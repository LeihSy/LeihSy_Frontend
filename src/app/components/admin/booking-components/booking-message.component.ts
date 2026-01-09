import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

interface ParsedMessageLine {
  text: string;
  prefixCount: number;
  isUserMessage: boolean; // true für +, false für -
  hasPrefix: boolean;
}

@Component({
  selector: 'app-booking-message',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    @if (message) {
      <p-card
        header="Nachricht / Kommunikationsverlauf"
        class="shadow-sm border border-gray-200 overflow-hidden mt-4"
        [pt]="{
          header: { class: 'bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200 font-semibold text-[#253359] p-4' }
        }">
        <div class="flex flex-col gap-2">
          @for (line of parsedLines(); track $index) {
            <div class="flex gap-3 p-3 rounded-lg transition-all"
                 [class]="getLineClasses(line)">
              <div class="flex items-start gap-2 min-w-0 flex-1">
                @if (line.hasPrefix) {
                  <span class="font-mono text-xs opacity-60 mt-0.5 flex-shrink-0">
                    {{ getPrefixDisplay(line) }}
                  </span>
                }
                @if (!line.hasPrefix) {
                  <i class="pi pi-comment text-lg mt-0.5 flex-shrink-0"
                     [class]="line.isUserMessage ? 'text-[#253359]' : 'text-purple-600'"></i>
                }
                <p class="text-sm leading-relaxed m-0 break-words min-w-0">
                  {{ line.text }}
                </p>
              </div>
            </div>
          }
        </div>
      </p-card>
    }
  `,
  styles: [`
    :host ::ng-deep .p-card-body {
      padding: 1rem;
    }
  `]
})
export class BookingMessageComponent {
  private messageSignal = signal<string | undefined>(undefined);

  @Input() set message(value: string | undefined) {
    this.messageSignal.set(value);
  }

  get message(): string | undefined {
    return this.messageSignal();
  }

  parsedLines = computed(() => {
    const msg = this.messageSignal();
    if (!msg) return [];

    return msg.split('\n')
      .filter(line => line.trim())
      .map(line => this.parseLine(line));
  });

  private parseLine(line: string): ParsedMessageLine {
    const trimmedLine = line.trim();

    // Prüfe auf Präfixe (+ oder -)
    const plusMatch = trimmedLine.match(/^(\+{1,})\s(.+)$/);
    const minusMatch = trimmedLine.match(/^(-{1,})\s(.+)$/);

    if (plusMatch) {
      return {
        text: plusMatch[2],
        prefixCount: plusMatch[1].length,
        isUserMessage: true,
        hasPrefix: true
      };
    }

    if (minusMatch) {
      return {
        text: minusMatch[2],
        prefixCount: minusMatch[1].length,
        isUserMessage: false,
        hasPrefix: true
      };
    }

    // Keine Präfixe - aktuelle Nachricht (Standard: User-Farbe)
    return {
      text: trimmedLine,
      prefixCount: 0,
      isUserMessage: true,
      hasPrefix: false
    };
  }

  getLineClasses(line: ParsedMessageLine): string {
    const baseClasses = 'border-l-4';

    if (!line.hasPrefix) {
      // Aktuelle Nachricht (ohne Präfix) - hervorgehoben
      return line.isUserMessage
        ? `${baseClasses} bg-[#253359]/10 border-[#253359] shadow-sm`
        : `${baseClasses} bg-purple-50 border-purple-500 shadow-sm`;
    }

    // Alte Nachrichten mit Präfix - abgestufte Opacity basierend auf Alter
    const opacity = Math.max(20, 100 - (line.prefixCount * 15));

    return line.isUserMessage
      ? `${baseClasses} bg-[#253359]/[0.${opacity}] border-[#253359]/60`
      : `${baseClasses} bg-purple-50/${opacity} border-purple-400`;
  }

  getPrefixDisplay(line: ParsedMessageLine): string {
    const char = line.isUserMessage ? '+' : '-';
    return char.repeat(line.prefixCount);
  }
}

