export interface GeographicCoordinates {
  lat: number;
  lon: number;
}

export interface WeatherRequestInfo {
  type: string;
  data: string | Position;
}
