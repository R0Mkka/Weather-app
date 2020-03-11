import { Injectable } from '@angular/core';
import * as d3 from 'd3';

import {
  Charts,
  CHART_WIDTH,
  CHART_HEIGHT,
  CHART_BAR_WIDTH,
  HALF_CHART_HEIGHT,
  BarColors,
} from '../config/chart.config';

@Injectable()
export class ChartService {
  private d3ChartElement = null;
  private leftOffset = 500;
  private dataRange: [number, number] = [null, null];

  public setChartElement(chartElementSelector: string): void {
    this.d3ChartElement = d3.select(chartElementSelector);
  }

  public increaseLeftOffset(value: number): void {
    this.leftOffset += value;
  }

  public renderChart(data: number[], chartType: Charts): void {
    if (!this.d3ChartElement) {
      console.warn('There must be the existing {d3ChartElement} in order to render chart.');

      return;
    }

    this.clearChart();
    this.setChartSize();

    switch (chartType) {
      case Charts.Temperature: {
        this.renderTemperatureChart(data);
        break;
      }
      case Charts.Humidity: {
        this.renderHumidityChart(data);
        break;
      }
    }

    this.leftOffset -= 11;

    this.normalizeLeftOffset();
  }

  private renderTemperatureChart(temperatureList: number[]): void {
    this.setDataRange(temperatureList);
    this.renderTemperatureChartBars(temperatureList);
    this.limitChartView();
    this.appendTimeScale(true);
    this.appendDataScale();
    this.putDataScaleLabel('Temperature, °C');
  }

  private renderHumidityChart(humidityList: number[]): void {
    this.dataRange = [0, 110];
    this.renderHumidityChartBars(humidityList);
    this.limitChartView();
    this.appendTimeScale(false);
    this.appendDataScale(-20);
    this.putDataScaleLabel('Humidity, %');
  }

  private clearChart(): void {
    this.d3ChartElement.selectAll('*').remove();
  }

  private setChartSize(): void {
    this.d3ChartElement
      .attr('width', CHART_WIDTH)
      .attr('height', CHART_HEIGHT);
  }

  private renderTemperatureChartBars(temperatureList: number[]): void {
    this.d3ChartElement.selectAll('rect')
      .data(temperatureList)
      .enter()
      .append('rect')
      .attr('width', CHART_BAR_WIDTH - 3)
      .attr('height', (temperature: number) => HALF_CHART_HEIGHT - this.scaleByData()(Math.abs(temperature)))
      .attr('y', (temperature: number) => {
        if (temperature > 0) {
          return;
        }

        return CHART_HEIGHT - this.scaleByData()(temperature + (Math.abs(temperature) * 2));
      })
      .attr('fill', (temperature: number) => temperature > 0 ? BarColors.Yellow : BarColors.Blue)
      .attr('transform', (temperature: number, index: number) => {
        const yOffset = this.scaleByData()(temperature);

        if (temperature < 0) {
          return `translate(${CHART_BAR_WIDTH * index + this.leftOffset}, -${yOffset - HALF_CHART_HEIGHT})`;
        }

        return `translate(${CHART_BAR_WIDTH * index + this.leftOffset}, ${yOffset})`;
      });
  }

  private renderHumidityChartBars(humidityList: number[]): void {
    this.d3ChartElement.selectAll('rect')
      .data(humidityList)
      .enter()
      .append('rect')
      .attr('width', CHART_BAR_WIDTH - 3)
      .attr('height', (humidity: number) => CHART_HEIGHT - this.scaleByData()(humidity))
      .attr('fill', BarColors.Default)
      .attr('transform', (humidity: number, index: number) => {
        return `translate(${CHART_BAR_WIDTH * index + this.leftOffset}, ${this.scaleByData()(humidity) - 20})`;
      });
  }

  private normalizeLeftOffset(): void {
    const oneAndHalfChartBarWidth = CHART_BAR_WIDTH * 1.5;
    const halfChartBarWidth = CHART_BAR_WIDTH / 2;

    if (this.leftOffset < -oneAndHalfChartBarWidth) {
      this.leftOffset += halfChartBarWidth;
    }

    if (this.leftOffset > 500 + oneAndHalfChartBarWidth) {
      this.leftOffset -= halfChartBarWidth;
    }
  }

  private appendDataScale(bottomOffset: number = 0): void {
    const dataAxis = d3.axisLeft()
      .scale(this.scaleByData());

    this.d3ChartElement.append('g')
      .attr('transform', `translate(40, ${bottomOffset})`)
      .call(dataAxis);
  }

  private setDataRange(data: number[]): void {
    const minValue = Math.abs(d3.min(data));
    const maxValue = Math.abs(d3.max(data));
    const range: [number, number] = [null, null];
    const additionalScope = 5;

    if (minValue > maxValue) {
      range[0] = 0 - minValue - additionalScope;
      range[1] = minValue + additionalScope;
    } else {
      range[0] = 0 - maxValue - additionalScope;
      range[1] = maxValue + additionalScope;
    }

    this.dataRange = range;
  }

  private scaleByData(): (value: number) => any {
    return d3.scaleLinear()
      .domain(this.dataRange)
      .range([CHART_HEIGHT, 0]);
  }

  private appendTimeScale(inCenter: boolean): void {
    const bottomOffset = inCenter
      ? HALF_CHART_HEIGHT
      : CHART_HEIGHT - 20;

    const timeScale = d3.scaleTime()
      .domain([Date.now() - 9000, Date.now()])
      .range([0, CHART_WIDTH]);

    const timeAxis = d3.axisBottom()
      .scale(timeScale)
      .ticks(3)
      .tickSize(8);

    this.d3ChartElement.append('g')
      .attr('transform', `translate(40, ${bottomOffset})`)
      .call(timeAxis);
  }

  private putDataScaleLabel(label: string): void {
    this.d3ChartElement.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (CHART_HEIGHT / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(label);
  }

  private limitChartView(): void {
    this.d3ChartElement.append('rect')
      .attr('width', '40')
      .attr('height', CHART_HEIGHT)
      .attr('x', '0')
      .attr('y', '0')
      .attr('fill', 'white');
  }
}
