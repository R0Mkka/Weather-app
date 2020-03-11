import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ChartsManagerComponent } from './components/charts-manager/charts-manager.component';
import { TemperatureChartComponent } from './components/temperature-chart/temperature-chart.component';
import { HumidityChartComponent } from './components/humidity-chart/humidity-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartsManagerComponent,
    TemperatureChartComponent,
    HumidityChartComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
