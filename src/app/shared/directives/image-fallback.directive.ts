import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({ selector: 'img[appImageFallback]', standalone: false })
export class ImageFallbackDirective {
  @Input() appImageFallback = '/images/placeholder-meuble.svg';

  constructor(private readonly element: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    const image = this.element.nativeElement;
    const fallback = this.appImageFallback || '/images/placeholder-meuble.svg';
    if (!image.src.endsWith(fallback)) image.src = fallback;
  }
}
