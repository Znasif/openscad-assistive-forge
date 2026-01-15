/**
 * Angular Application Configuration
 * @license GPL-3.0-or-later
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true })
  ]
};
