import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WeatherModule } from './weather/weather.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WeatherModule,
  ],
  controllers: [
    AppController,
  ],
})
export class AppModule {}
