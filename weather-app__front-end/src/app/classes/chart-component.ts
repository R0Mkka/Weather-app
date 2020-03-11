import { OnDestroy, NgZone, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { getName } from 'country-list';

import { WeatherService } from '../services/weather.service';

export abstract class ChartComponent implements OnDestroy {
  @Output() requestError = new EventEmitter<void>();
  @Output() weatherRequest = new EventEmitter<void>();

  public  currentDate = Date.now();

  protected isFreezed = false;
  protected timer: any = null;
  protected currentWeatherObject = null;
  protected subsDestroyer$ = new Subject<void>();
  protected weatherService: WeatherService;
  protected ngZone: NgZone;

  constructor(
    weatherService: WeatherService,
    ngZone: NgZone,
  ) {
    this.weatherService = weatherService;
    this.ngZone = ngZone;
  }

  public ngOnDestroy(): void {
    this.subsDestroyer$.next();
    this.subsDestroyer$.complete();
  }

  public get countryNameWithCode(): string {
    if (!this.currentWeatherObject) {
      return 'loading...';
    }

    const countryCode = this.currentWeatherObject.sys.country;
    const countryName = getName(countryCode);

    return `${countryName}, ${countryCode}`;
  }

  public get cityName(): string {
    if (!this.currentWeatherObject) {
      return 'loading...';
    }

    return this.currentWeatherObject.name;
  }
}
