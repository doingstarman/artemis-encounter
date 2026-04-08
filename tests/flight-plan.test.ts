import { describe, it, expect } from "vitest";
import {
  generateTrajectory,
  resolveStageByProgress,
  createKeyPoints,
  FLIGHT_STAGES,
} from "@/lib/flight-plan";

describe("resolveStageByProgress", () => {
  it("progress=0 → launch", () => {
    expect(resolveStageByProgress(0).id).toBe("launch");
  });

  it("progress=0.3 → tli", () => {
    expect(resolveStageByProgress(0.3).id).toBe("tli");
  });

  it("progress=0.52 → flyby", () => {
    expect(resolveStageByProgress(0.52).id).toBe("flyby");
  });

  it("progress=0.8 → return", () => {
    expect(resolveStageByProgress(0.8).id).toBe("return");
  });

  it("progress=1 → splashdown", () => {
    expect(resolveStageByProgress(1).id).toBe("splashdown");
  });

  it("defaults to last stage for out-of-range progress", () => {
    expect(resolveStageByProgress(1.5).id).toBe("splashdown");
  });
});

describe("generateTrajectory", () => {
  it("returns exactly pointCount elements", () => {
    expect(generateTrajectory(180)).toHaveLength(180);
    expect(generateTrajectory(60)).toHaveLength(60);
  });

  it("first point starts near Earth", () => {
    const pts = generateTrajectory(180);
    expect(pts[0].x).toBeCloseTo(130, 0);
    expect(pts[0].y).toBeCloseTo(280, 0);
  });

  it("midpoint (t≈0.5) is near the Moon", () => {
    const pts = generateTrajectory(180);
    const mid = pts.find((p) => Math.abs(p.t - 0.5) < 0.01)!;
    expect(mid).toBeDefined();
    // Moon is at ~(880, 180)
    expect(mid.x).toBeGreaterThan(700);
    expect(mid.y).toBeLessThan(250);
  });

  it("last point returns near Earth (round-trip)", () => {
    const pts = generateTrajectory(180);
    const last = pts[pts.length - 1];
    expect(last.x).toBeCloseTo(130, 0);
    expect(last.y).toBeCloseTo(280, 0);
  });

  it("t values are monotonically non-decreasing", () => {
    const pts = generateTrajectory(180);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].t).toBeGreaterThanOrEqual(pts[i - 1].t);
    }
  });

  it("assigns unique ids", () => {
    const pts = generateTrajectory(20);
    const ids = new Set(pts.map((p) => p.id));
    expect(ids.size).toBe(20);
  });
});

describe("createKeyPoints", () => {
  const trajectory = generateTrajectory(180);
  const keyPoints = createKeyPoints(trajectory);

  it("returns 5 key points", () => {
    expect(keyPoints).toHaveLength(5);
  });

  it("launch is near Earth", () => {
    const launch = keyPoints.find((kp) => kp.id === "launch")!;
    expect(launch.x).toBeLessThan(400);
  });

  it("flyby is near Moon (midpoint)", () => {
    const flyby = keyPoints.find((kp) => kp.id === "flyby")!;
    expect(flyby.x).toBeGreaterThan(600);
  });

  it("splashdown is near Earth (return leg)", () => {
    const splash = keyPoints.find((kp) => kp.id === "splashdown")!;
    expect(splash.x).toBeLessThan(400);
  });
});

describe("FLIGHT_STAGES", () => {
  it("has 5 stages", () => {
    expect(FLIGHT_STAGES).toHaveLength(5);
  });

  it("stages cover full range 0 to 1", () => {
    expect(FLIGHT_STAGES[0].startProgress).toBe(0);
    expect(FLIGHT_STAGES[FLIGHT_STAGES.length - 1].endProgress).toBe(1);
  });

  it("stages are contiguous (no gaps)", () => {
    for (let i = 1; i < FLIGHT_STAGES.length; i++) {
      expect(FLIGHT_STAGES[i].startProgress).toBeCloseTo(
        FLIGHT_STAGES[i - 1].endProgress,
        5,
      );
    }
  });
});
