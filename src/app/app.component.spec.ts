import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('affiche le point de sortie du routeur NgModule', async () => {
    await TestBed.configureTestingModule({ imports: [RouterModule.forRoot([])], declarations: [AppComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Hello');
  });
});
