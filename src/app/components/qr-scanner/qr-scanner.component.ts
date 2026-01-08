import { Component, ElementRef, OnDestroy, viewChild, input, output, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
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
  imports: [CommonModule, DialogModule, FilledButtonComponent, SecondaryButtonComponent],
  templateUrl: './qr-scanner.component.html'
})
export class QrScannerComponent implements OnDestroy {
  // Signal-basierte Inputs/Outputs (v20 Standard)
  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  scanned = output<string>();

  // Zugriff auf das Video-Element via Signal
  videoEl = viewChild<ElementRef<HTMLVideoElement>>('videoEl');

  private stream: MediaStream | null = null;
  private detector: BarcodeDetector | null = null;
  private loopHandle: any = null;

  // Signal States für reaktive UI
  running = signal(false);
  support = signal(isPlatformBrowser(inject(PLATFORM_ID)) && 'BarcodeDetector' in globalThis);

  async start(): Promise<void> {
    if (this.running() || !this.support()) return;

    try {
      this.detector = new BarcodeDetector({ formats: ['qr_code'] });

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });

      const video = this.videoEl()?.nativeElement;
      if (video) {
        video.srcObject = this.stream;
        // Warten bis Video geladen ist
        video.onloadedmetadata = () => video.play();
      }

      this.running.set(true);
      this.scanLoop();
    } catch (err) {
      console.error('Kamera-Fehler:', err);
      this.support.set(false);
    }
  }

  private async scanLoop() {
    if (!this.running()) return;

    try {
      const video = this.videoEl()?.nativeElement;
      if (video && video.readyState >= 2) { // HAVE_CURRENT_DATA
        const barcodes = await this.detector?.detect(video);

        if (barcodes && barcodes.length > 0) {
          const value = barcodes[0].rawValue;
          if (value) {
            this.scanned.emit(value);
            this.close(); // Stop & Close nach Erfolg
            return;
          }
        }
      }
    } catch (err) {
      console.debug('Scan-Intervall Fehler (normal während Fokus):', err);
    }

    // Effizienteres Loop-Handling
    this.loopHandle = setTimeout(() => this.scanLoop(), 250);
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
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
