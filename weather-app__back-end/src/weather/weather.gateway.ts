import { Logger } from '@nestjs/common';
import { WebSocketGateway, OnGatewayInit, SubscribeMessage, OnGatewayDisconnect } from '@nestjs/websockets';

import { WeatherService } from './weather.service';

import { GeographicCoordinates } from '../models';
import { WeatherEvents } from '../config/weather-events.config';

@WebSocketGateway()
export class WeatherGateway implements OnGatewayInit, OnGatewayDisconnect {
  private logger: Logger = new Logger('WeatherGateway');

  constructor(
    private weatherService: WeatherService,
  ) {}

  public afterInit(): void {
    this.logger.log('WeatherGateway was initialized!');
  }

  public handleDisconnect(): void {
    this.weatherService.stopEmittingWeatherUpdates();
  }

  @SubscribeMessage(WeatherEvents.START_DEFAULT)
  public startDefaultWeatherEmitter(socket, geographicCoords: GeographicCoordinates): void {
    this.weatherService
      .startEmittingWeatherUpdates(geographicCoords)
      .subscribe(currentWeather => {
        socket.emit('weatherUpdate', currentWeather);
      });
  }

  @SubscribeMessage(WeatherEvents.START_BY_LOCATION)
  public startWeatherEmitterByLocaton(socket, locationInfoString: string): void {
    this.closeWeatherUpdatesListener();

    this.weatherService
      .startEmittingWeatherUpdatesByLocation(locationInfoString)
      .subscribe(currentWeather => {
        socket.emit(WeatherEvents.UPDATE, currentWeather);
      });
  }

  @SubscribeMessage(WeatherEvents.CLOSE)
  public closeWeatherUpdatesListener(): void {
    this.weatherService.stopEmittingWeatherUpdates();
  }
}
