import { Component, OnInit, NgZone, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { WeatherService } from '../../services/weather.service';
import { ChartService } from '../../services/chart.service';

import { ChartComponent } from './../../classes/chart-component';
import { Charts, CHART_BAR_WIDTH, CHART_RERENDER_DELAY, MAX_BAR_COUNT } from '../../config/chart.config';

@Component({
  selector: 'app-humidity-chart',
  templateUrl: './humidity-chart.component.html',
  styleUrls: ['./humidity-chart.component.scss'],
  providers: [
    ChartService,
  ],
})
export class HumidityChartComponent extends ChartComponent implements OnInit {
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

  private humidityList = [];

  constructor(
    weatherService: WeatherService,
    ngZone: NgZone,
    private chartService: ChartService,
  ) {
    super(weatherService, ngZone);
  }

  public ngOnInit(): void {
    this.chartService.setChartElement('#humidity-chart');
    this.chartService.renderChart(this.humidityList, Charts.Humidity);

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

          if (this.currentWeatherObject && this.currentWeatherObject.name !== weatherDataObject.name) {
            this.humidityList = [];
          }

          this.humidityList.push(weatherDataObject.main.humidity);
          this.currentWeatherObject = weatherDataObject;

          if (this.humidityList.length > MAX_BAR_COUNT) {
            this.humidityList = this.humidityList.slice(1);

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
        this.chartService.renderChart(this.humidityList, Charts.Humidity);
      }, CHART_RERENDER_DELAY);
    });
  }
}
