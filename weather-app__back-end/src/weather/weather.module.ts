import { Module, HttpModule } from '@nestjs/common';

import { WeatherGateway } from './weather.gateway';
import { WeatherService } from './weather.service';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    WeatherGateway,
    WeatherService,
  ],
})
export class WeatherModule {}