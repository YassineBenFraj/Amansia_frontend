import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, Output, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';

interface GoogleIdentity {
  accounts: {
    id: {
      initialize(config: { client_id: string; callback: (response: { credential?: string }) => void; ux_mode: 'popup' }): void;
      renderButton(element: HTMLElement, options: { theme: string; size: string; text: string; width: number; locale: string }): void;
    };
  };
}

@Component({
  selector: 'app-google-button',
  standalone: false,
  templateUrl: './google-button.component.html',
  styleUrl: './google-button.component.css'
})
export class GoogleButtonComponent implements AfterViewInit {
  @Input() busy = false;
  @Output() credential = new EventEmitter<string>();
  @ViewChild('button', { static: true }) button!: ElementRef<HTMLElement>;
  error = '';
  private static script?: Promise<GoogleIdentity>;

  constructor(private readonly zone: NgZone) {}

  async ngAfterViewInit(): Promise<void> {
    if (!environment.googleClientId.trim()) {
      this.error = 'La connexion Google n’est pas encore configurée.';
      return;
    }
    try {
      const google = await GoogleButtonComponent.loadScript();
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        ux_mode: 'popup',
        callback: response => this.zone.run(() => {
          if (response.credential) this.credential.emit(response.credential);
          else this.error = 'Connexion Google impossible. Réessayez.';
        })
      });
      google.accounts.id.renderButton(this.button.nativeElement,
        { theme: 'outline', size: 'large', text: 'continue_with', width: Math.min(this.button.nativeElement.clientWidth, 400), locale: 'fr' });
    } catch {
      this.zone.run(() => { this.error = 'Connexion Google indisponible. Réessayez plus tard.'; });
    }
  }

  private static loadScript(): Promise<GoogleIdentity> {
    if (this.script) return this.script;
    this.script = new Promise<GoogleIdentity>((resolve, reject) => {
      const current = (window as Window & { google?: GoogleIdentity }).google;
      if (current) { resolve(current); return; }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        const google = (window as Window & { google?: GoogleIdentity }).google;
        if (google) resolve(google); else reject(new Error('Google Identity unavailable'));
      };
      script.onerror = () => reject(new Error('Google Identity unavailable'));
      document.head.appendChild(script);
    }).catch(error => { this.script = undefined; throw error; });
    return this.script;
  }
}
