import { Component, OnInit, Input, NgZone } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { WeatherService } from '../../services/weather.service';
import { ChartService } from '../../services/chart.service';

import { ChartComponent } from './../../classes/chart-component';
import { Charts, CHART_BAR_WIDTH, CHART_RERENDER_DELAY } from '../../config/chart.config';

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.scss'],
  providers: [
    ChartService,
  ],
})
export class TemperatureChartComponent extends ChartComponent implements OnInit {
  @Input() set isFreezed(value: boolean) {
    if (value) {
      this.stop();
    }
  }

  @Input() set isContinued(value: boolean) {
    if (value) {
      this.continue();
    }
  }

  private temperatureList = [];

  constructor(
    weatherService: WeatherService,
    ngZone: NgZone,
    private chartService: ChartService,
  ) {
    super(weatherService, ngZone);
  }

  public ngOnInit(): void {
    this.chartService.setChartElement('#temperature-chart');
    this.chartService.renderChart(this.temperatureList, Charts.Temperature);

    this.weatherRequest.emit();
    this.startCircleChartRendering();
    this.subOnWeatherChanges();
  }

  private stop(): void {
    this.weatherService.closeListening();
    this.subsDestroyer$.next();

    clearInterval(this.timer);
  }

  private continue(): void {
    this.weatherRequest.emit();

    this.startCircleChartRendering();
    this.subOnWeatherChanges();
  }

  private subOnWeatherChanges(): void {
    this.weatherService
      .onWeatherUpdate()
      .pipe(takeUntil(this.subsDestroyer$))
      .subscribe(
        weatherDataObject => {
          if (!weatherDataObject.main) {
            this.requestError.emit();

            return;
          }

          const celsius = weatherDataObject.main.temp - 273;

          if (this.currentWeatherObject && this.currentWeatherObject.name !== weatherDataObject.name) {
            this.temperatureList = [];
          }

          this.temperatureList.push(celsius);
          this.currentWeatherObject = weatherDataObject;

          if (this.temperatureList.length > 6) {
            this.temperatureList = this.temperatureList.slice(1);

            this.chartService.increaseLeftOffset(CHART_BAR_WIDTH);
          }
        },
        error => {
          this.stop();
        });
  }

  private startCircleChartRendering(): void {
    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.chartService.renderChart(this.temperatureList, Charts.Temperature);
      }, CHART_RERENDER_DELAY);
    });
  }
}
