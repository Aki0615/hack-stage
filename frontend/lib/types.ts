export type Issue = { field: string; message: string };

export type ImportRecord = {
  row: number;
  name: string;
  grade: string;
  address: string;
  use_morning: boolean | null;
  use_evening: boolean | null;
  status: "ok" | "failed" | "low_accuracy";
  lat: number | null;
  lng: number | null;
  issues: Issue[];
};

export type ImportResult = {
  total: number;
  ok_count: number;
  needs_check_count: number;
  column_mapping: Record<string, string>;
  records: ImportRecord[];
};

export type StopCandidate = {
  label: number;
  lat: number;
  lng: number;
  student_count: number;
  avg_walk_m: number;
  max_walk_m: number;
  reason: string;
  warnings: string[];
};

export type Strategy = "efficiency" | "fairness" | "safety";

export type RoutePlan = {
  id: string;
  strategy: Strategy;
  summary: string;
  metrics: {
    total_time: number;
    stop_count: number;
    average_walk_distance: number;
    max_walk_distance: number;
    walk_distance_spread: number;
    safety_check_count: number;
    all_within_400m: boolean;
  };
  buses: { bus: number; stops: { stop_label: number; time: string }[] }[];
  stops: StopCandidate[];
};
