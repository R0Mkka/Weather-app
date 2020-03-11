import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';

import { GeographicCoordinates } from '../models';
import { WeatherEvents } from '../config/weather-events.config';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private socket: io.Socket;

  constructor() {
    this.initSocket();
  }

  public onWeatherUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on(
        WeatherEvents.UPDATE,
        (data: any) => observer.next(data),
      );
    });
  }

  public sendDefaultWeatherRequest(geolocationPosition: Position): void {
    const { latitude, longitude } = geolocationPosition.coords;
    const geographicCoordenates: GeographicCoordinates = {
      lat: latitude,
      lon: longitude,
    };

    this.socket.emit(WeatherEvents.START_DEFAULT, geographicCoordenates);
  }

  public sendWeatherRequestByLocation(locationInfoString: string): void {
    this.socket.emit(WeatherEvents.START_BY_LOCATION, locationInfoString);
  }

  public closeListening(): void {
    this.socket.emit(WeatherEvents.CLOSE);
  }

  private initSocket(): void {
    this.socket = io('http://localhost:3000');
  }
}
