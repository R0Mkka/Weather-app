import { Injectable, HttpService, OnModuleDestroy } from '@nestjs/common';
import { interval, Subject, Observable, of } from 'rxjs';
import { map, switchMap, takeUntil, catchError } from 'rxjs/operators';

import { WEATHER_API, REQUESTS_INTERVAL } from '../constants';
import { GeographicCoordinates } from '../models';

@Injectable()
export class WeatherService implements OnModuleDestroy {
  private subsDestroyer$ = new Subject<void>();
  private readonly apiAccessKey = process.env.WEATHER_API_KEY;

  constructor(
    private httpService: HttpService,
  ) {}

  public onModuleDestroy(): void {
    this.subsDestroyer$.next();
    this.subsDestroyer$.complete();
  }

  public startEmittingWeatherUpdates(geographicCoords: GeographicCoordinates): Observable<any> {
    this.stopEmittingWeatherUpdates();

    const formattedEndpoint = this.getEndpointFormattedByCoordinates(geographicCoords);
    
    return interval(REQUESTS_INTERVAL)
      .pipe(
        switchMap(() => this.httpService.get(formattedEndpoint)),
        map(axiosResponse => axiosResponse.data),
        takeUntil(this.subsDestroyer$),
        catchError(err => of(err)),
      );
  }

  public startEmittingWeatherUpdatesByLocation(locationString: string): Observable<any> {
    const formattedEndpoint = this.getEndpointFormattedByLocation(locationString);

    return interval(REQUESTS_INTERVAL)
      .pipe(
        switchMap(() => this.httpService.get(formattedEndpoint)),
        map(axiosResponse => axiosResponse.data),
        takeUntil(this.subsDestroyer$),
        catchError(err => of(err)),
      );
  }

  public stopEmittingWeatherUpdates(): void {
    if (!this.subsDestroyer$.isStopped) {
      this.subsDestroyer$.next();
    }
  }

  private getEndpointFormattedByCoordinates(geographicCoords: GeographicCoordinates): string {
    const { lat, lon } = geographicCoords;

    return `${WEATHER_API}/weather?lat=${lat}&lon=${lon}&appid=${this.apiAccessKey}`;
  }

  private getEndpointFormattedByLocation(locationString: string): string {
    return `${WEATHER_API}/weather?q=${locationString}&appid=${this.apiAccessKey}`;
  }
}