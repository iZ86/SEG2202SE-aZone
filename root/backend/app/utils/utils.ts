import { Request, Response, NextFunction } from "express";

/** Async wrapper used to wrap the controller functions.
 * This is needed because async functions in router.get/post/put/.. won't be caught by the global error middleware.
 * So a async wrapper is needed.
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next);
};

export function isTimeRangeColliding(
  startTime: Date,
  endTime: Date,
  startTimeTwo: Date,
  endTimeTwo: Date
): boolean {
  // Helper function to get time in minutes, treating 00:00 as 1440 if it's an end time
  // const getTimeValue = (date: Date, isEndTime: boolean): number => {
  //   const totalMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  //   // If it's an end time and shows as 00:00, treat it as 1440 (end of day)
  //   if (isEndTime && totalMinutes === 0) {
  //     return 1440;
  //   }
  //   return totalMinutes;
  // };

  // const start1 = getTimeValue(startTime, false);
  // const end1 = getTimeValue(endTime, true);
  // const start2 = getTimeValue(startTimeTwo, false);
  // const end2 = getTimeValue(endTimeTwo, true);

  // Check for collision
  return !(endTime <= startTimeTwo || endTimeTwo <= startTime);
}
