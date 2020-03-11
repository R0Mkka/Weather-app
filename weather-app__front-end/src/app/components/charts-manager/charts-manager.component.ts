import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { WeatherService } from './../../services/weather.service';
import { WeatherRequestInfo } from '../../models';

@Component({
  selector: 'app-charts-manager',
  templateUrl: './charts-manager.component.html',
  styleUrls: ['./charts-manager.component.scss'],
})
export class ChartsManagerComponent implements OnInit {
  public isFreezed = false;
  public isContinued = false;
  public placePickerField: FormControl;
  public errorText = '';
  public showError = false;

  private lastRequestInfo: WeatherRequestInfo = {
    type: 'default',
    data: null,
  };

  constructor(
    private weatherService: WeatherService,
  ) {}

  public ngOnInit(): void {
    this.initFieldControl();
    this.subOnUserInput();
  }

  public onRequestError(): void {
    this.errorText = 'Request was failed! Please, ckeck your input and try again';
    this.showError = true;
  }

  public doWeatherRequest(): void {
    if (this.lastRequestInfo.type === 'default') {
      this.sendDefaultWeatherRequest();

      return;
    }

    this.weatherService.sendWeatherRequestByLocation(this.lastRequestInfo.data as string);
  }

  public onLocate(): void {
    const userInput: string = this.placePickerField.value;

    if (this.lastRequestInfo.data === userInput) {
      return;
    }

    this.weatherService.sendWeatherRequestByLocation(userInput);
    this.updateLastRequestInfo('byLocation', userInput);
  }

  public onChartsFreeze(): void {
    this.isFreezed = true;
    this.isContinued = false;
  }

  public onChartsContinue(): void {
    this.isContinued = true;
    this.isFreezed = false;
  }

  private sendDefaultWeatherRequest(): void {
    this.getGeolocationPosition()
      .then((position: Position) => {
        this.weatherService.sendDefaultWeatherRequest(position);

        this.updateLastRequestInfo('default', position);
      });
  }

  private getGeolocationPosition(): Promise<Position> {
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition((currentPosition: Position) => {
        resolve(currentPosition);
      });
    });
  }

  private initFieldControl(): void {
    this.placePickerField = new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?:\w+,){2,}(?:\w+)$/)],
    );
  }

  private subOnUserInput(): void {
    this.placePickerField.valueChanges
      .subscribe(() => {
        this.showError = false;
      });
  }

  private updateLastRequestInfo(type: string, data: string | Position): void {
    this.lastRequestInfo = { type, data };
  }
}
