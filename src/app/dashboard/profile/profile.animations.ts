import { trigger, transition, style, animate } from '@angular/animations';

export const fadeUp = trigger('fadeUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate('300ms cubic-bezier(.2,.8,.2,1)',
      style({ opacity: 1, transform: 'none' })
    )
  ])
]);
