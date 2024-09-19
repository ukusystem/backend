// compatible con dayjs
export enum Day {
  "Sunday" = 0,
  "Monday" = 1,
  "Tuesday" = 2,
  "Wednesday" = 3,
  "Thursday" = 4,
  "Friday" = 5,
  "Saturday" = 6,
}

export interface RangeTime {
  rt_id: number;
  startTime: string;
  endTime: string;
}

export type DayEvents = Map<number, RangeTime>;

export type WeekEvents = Map<Day, DayEvents>;

export type ControllerNVR = Map<number, WeekEvents>;
