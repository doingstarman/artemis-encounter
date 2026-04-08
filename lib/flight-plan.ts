import type {
  FlightPlanResponse,
  FlightStage,
  Mission,
  MissionKeyPoint,
  TrajectoryPoint,
} from "@/lib/types";

const MISSION: Mission = {
  id: "artemis-2",
  name: "Artemis II",
  status: "Подготовка к пилотируемому облету Луны",
  focus: "Первый пилотируемый полет программы Artemis",
  launchWindow: "Ориентировочно 2026",
  crew: ["Reid Wiseman", "Victor Glover", "Christina Koch", "Jeremy Hansen"],
};

export const FLIGHT_STAGES: FlightStage[] = [
  {
    id: "launch",
    title: "Запуск и выведение",
    description: "SLS выводит Orion на околоземную орбиту. Проверка систем перед TLI.",
    eta: "T+0h - T+2h",
    startProgress: 0,
    endProgress: 0.18,
  },
  {
    id: "tli",
    title: "Trans-Lunar Injection",
    description: "Разгон Orion к Луне, переход на траекторию свободного возврата.",
    eta: "T+2h - T+24h",
    startProgress: 0.18,
    endProgress: 0.43,
  },
  {
    id: "flyby",
    title: "Лунный облет",
    description: "Проход вблизи Луны, съемка, навигационные и системные проверки экипажа.",
    eta: "T+2d - T+4d",
    startProgress: 0.43,
    endProgress: 0.67,
  },
  {
    id: "return",
    title: "Возвращение к Земле",
    description: "Переход на обратную траекторию, подготовка к входу в атмосферу.",
    eta: "T+4d - T+9d",
    startProgress: 0.67,
    endProgress: 0.92,
  },
  {
    id: "splashdown",
    title: "Вход и приводнение",
    description: "Сервисный модуль отделяется, Orion входит в атмосферу и приводняется.",
    eta: "T+9d - T+10d",
    startProgress: 0.92,
    endProgress: 1,
  },
];

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const oneMinusT = 1 - t;
  return (
    oneMinusT ** 3 * p0 +
    3 * oneMinusT ** 2 * t * p1 +
    3 * oneMinusT * t ** 2 * p2 +
    t ** 3 * p3
  );
}

export function generateTrajectory(pointCount = 180): TrajectoryPoint[] {
  const earth = { x: 130, y: 280 };
  const moon = { x: 880, y: 180 };

  // Outbound: Earth → Moon
  const out = { ctrl1: { x: 350, y: 80 }, ctrl2: { x: 650, y: 380 } };
  // Return: Moon → Earth (different arc so paths are visually distinct)
  const ret = { ctrl1: { x: 700, y: 80 }, ctrl2: { x: 300, y: 350 } };

  const half = Math.floor(pointCount / 2);
  const points: TrajectoryPoint[] = [];

  // Outbound segment: t ∈ [0, 0.5)
  for (let i = 0; i < half; i++) {
    const s = i / (half - 1); // 0..1 within this segment
    const globalT = s * 0.5;
    points.push({
      id: `p-${i}`,
      t: globalT,
      x: cubicBezier(s, earth.x, out.ctrl1.x, out.ctrl2.x, moon.x),
      y: cubicBezier(s, earth.y, out.ctrl1.y, out.ctrl2.y, moon.y),
    });
  }

  // Return segment: t ∈ [0.5, 1]
  const remaining = pointCount - half;
  for (let i = 0; i < remaining; i++) {
    const s = i / (remaining - 1); // 0..1 within this segment
    const globalT = 0.5 + s * 0.5;
    points.push({
      id: `p-${half + i}`,
      t: globalT,
      x: cubicBezier(s, moon.x, ret.ctrl1.x, ret.ctrl2.x, earth.x),
      y: cubicBezier(s, moon.y, ret.ctrl1.y, ret.ctrl2.y, earth.y),
    });
  }

  return points;
}

export function createKeyPoints(trajectory: TrajectoryPoint[]): MissionKeyPoint[] {
  const byProgress = (progress: number): TrajectoryPoint => {
    const exact = trajectory.find((point) => point.t >= progress);
    return exact ?? trajectory[trajectory.length - 1];
  };

  const points = [
    { id: "launch", label: "Launch", progress: 0.04 },
    { id: "tli", label: "TLI", progress: 0.22 },
    { id: "flyby", label: "Flyby", progress: 0.50 },
    { id: "return", label: "Return", progress: 0.78 },
    { id: "splashdown", label: "Splashdown", progress: 0.98 },
  ];

  return points.map((entry) => {
    const pos = byProgress(entry.progress);
    return {
      ...entry,
      x: pos.x,
      y: pos.y,
    };
  });
}

export function resolveStageByProgress(progress: number): FlightStage {
  return (
    FLIGHT_STAGES.find((stage) => progress >= stage.startProgress && progress <= stage.endProgress) ??
    FLIGHT_STAGES[FLIGHT_STAGES.length - 1]
  );
}

export function getFlightPlan(): FlightPlanResponse {
  const trajectory = generateTrajectory();
  return {
    mission: MISSION,
    stages: FLIGHT_STAGES,
    keyPoints: createKeyPoints(trajectory),
    trajectory,
    updatedAt: new Date().toISOString(),
    fallback: false,
  };
}
