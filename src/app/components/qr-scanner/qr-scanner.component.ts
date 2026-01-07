import { Component, ElementRef, OnDestroy, viewChild, input, output, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FilledButtonComponent } from '../buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../buttons/secondary-button/secondary-button.component';

// Interface für die Barcode Detector API
interface BarcodeDetector {
  detect(source: ImageBitmapSource): Promise<any[]>;
}

declare const BarcodeDetector: {
  prototype: BarcodeDetector;
  new (options?: { formats: string[] }): BarcodeDetector;
};

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    DialogModule,
    FilledButtonComponent,
    SecondaryButtonComponent
  ],
  template: `
    <p-dialog
      header="QR-Code Scanner / Token Eingabe"
      [visible]="visible()"
      (visibleChange)="onDialogVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [closable]="true"
      [style]="{width: '420px'}"
    >
      <div class="flex flex-col items-center gap-4">

        @if (!support()) {
          <div class="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200 w-full text-center">
            <i class="pi pi-exclamation-triangle mr-1"></i>
            Kamera-Scan nicht verfügbar (Browser inkompatibel). Bitte Token manuell eingeben.
          </div>
        }

        <div class="w-full flex flex-col items-center relative">
          <video
            #videoEl
            autoplay
            muted
            playsinline
            class="rounded-md border shadow-inner bg-black w-full h-64 object-cover"
          ></video>

          @if (support()) {
            <div class="mt-4 flex gap-3">
              @if (!running()) {
                <app-filled-button
                  label="Kamera Start"
                  icon="pi pi-video"
                  (buttonClick)="start()">
                </app-filled-button>
              }

              @if (running()) {
                <app-secondary-button
                  label="Stop"
                  icon="pi pi-stop"
                  color="gray"
                  (buttonClick)="stop()">
                </app-secondary-button>
              }
            </div>
          }
        </div>

        <div class="flex items-center w-full gap-2 text-gray-400 text-sm my-2">
          <div class="h-px bg-gray-200 flex-1"></div>
          <span>ODER MANUELL</span>
          <div class="h-px bg-gray-200 flex-1"></div>
        </div>

        <div class="w-full flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Token Code eingeben</label>
          <div class="flex gap-2">
            <input
              pInputText
              [(ngModel)]="manualToken"
              placeholder="z.B. A7F4C8D9"
              class="flex-1 uppercase font-mono"
              (keyup.enter)="submitManualToken()"
            />
            <app-filled-button
              label="OK"
              icon="pi pi-check"
              (buttonClick)="submitManualToken()">
            </app-filled-button>
          </div>
          <small class="text-gray-500 text-xs">Geben Sie den 8-stelligen Code ein, der unter dem QR-Code steht.</small>
        </div>

        <div class="w-full flex justify-end border-t pt-4 mt-2">
          <app-secondary-button
            label="Abbrechen"
            color="red"
            (buttonClick)="close()">
          </app-secondary-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class QrScannerComponent implements OnDestroy {
  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  scanned = output<string>();

  videoEl = viewChild<ElementRef<HTMLVideoElement>>('videoEl');

  private stream: MediaStream | null = null;
  private detector: BarcodeDetector | null = null;
  private loopHandle: any = null;

  running = signal(false);
  support = signal(isPlatformBrowser(inject(PLATFORM_ID)) && 'BarcodeDetector' in globalThis);
  manualToken = signal('');

  onDialogVisibleChange(isVisible: boolean) {
    if (!isVisible) {
      this.close();
    }
  }

  async start(): Promise<void> {
    if (this.running() || !this.support()) return;

    try {
      if ('BarcodeDetector' in globalThis) {
        this.detector = new BarcodeDetector({ formats: ['qr_code'] });
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      const video = this.videoEl()?.nativeElement;
      if (video) {
        video.srcObject = this.stream;
        video.onloadedmetadata = () => {
          video.play().catch(e => console.error('Video Play Error:', e));
        };
      }

      this.running.set(true);
      this.scanLoop();
    } catch (err) {
      console.error('Kamera-Fehler:', err);
    }
  }

  private async scanLoop() {
    if (!this.running()) return;

    try {
      const video = this.videoEl()?.nativeElement;
      if (video && video.readyState >= 2) {
        const barcodes = await this.detector?.detect(video);

        if (barcodes && barcodes.length > 0) {
          const value = barcodes[0].rawValue;
          if (value) {
            this.emitResult(value);
            return;
          }
        }
      }
    } catch (err) {
      if (this.running()) {
        console.debug('Scan frame skip:', err);
      }
    }

    this.loopHandle = setTimeout(() => this.scanLoop(), 250);
  }

  submitManualToken() {
    const token = this.manualToken().trim();
    if (token) {
      this.emitResult(token);
    }
  }

  private emitResult(value: string) {
    this.scanned.emit(value);
    this.close();
    this.manualToken.set('');
  }

  stop(): void {
    this.running.set(false);
    if (this.loopHandle) {
      clearTimeout(this.loopHandle);
      this.loopHandle = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    const video = this.videoEl()?.nativeElement;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }

  close(): void {
    this.stop();
    this.visibleChange.emit(false);
    this.manualToken.set('');
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
