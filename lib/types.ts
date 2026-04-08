export type Mission = {
  id: string;
  name: string;
  status: string;
  focus: string;
  launchWindow: string;
  crew: string[];
};

export type FlightStage = {
  id: string;
  title: string;
  description: string;
  eta: string;
  startProgress: number;
  endProgress: number;
};

export type TrajectoryPoint = {
  id: string;
  t: number;
  x: number;
  y: number;
};

export type MissionKeyPoint = {
  id: string;
  label: string;
  progress: number;
  x: number;
  y: number;
};

export type MissionNewsItem = {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
  summary: string;
  source: string;
};

export type MissionMediaItem = {
  id: string;
  title: string;
  imageUrl: string;
  nasaUrl: string;
  capturedAt?: string;
};

export type FlightPlanResponse = {
  mission: Mission;
  stages: FlightStage[];
  keyPoints: MissionKeyPoint[];
  trajectory: TrajectoryPoint[];
  updatedAt: string;
  fallback: boolean;
};

export type NewsResponse = {
  items: MissionNewsItem[];
  updatedAt: string;
  fallback: boolean;
};

export type MediaResponse = {
  items: MissionMediaItem[];
  updatedAt: string;
  fallback: boolean;
};

export type TelemetryData = {
  speedKms: number;
  altitudeKm: number;
  distanceFromEarthKm: number;
  distanceFromMoonKm: number;
  outsideTempC: number;
  gForce?: number;
  missionElapsedMs: number | null;
  isLive: boolean;
  source: "arow" | "horizons" | "calculated" | "prelaunch";
};

export type TelemetryResponse = {
  data: TelemetryData;
  updatedAt: string;
  fallback: boolean;
};
