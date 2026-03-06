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

/** Used to run validators if the role is admin. */
export const runValidatorIfAdmin = (fns: Function[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.isAdmin) return next();
    let i = 0;
    const runNext = () => {
      if (i >= fns.length) return next();
      fns[i++](req, res, runNext);
    };
    runNext();
  };

export function isDateRangeClashing(
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

/**
 * Helper function used to help check time clashing between two enrollment subject type.
 * @param startOne 
 * @param endOne 
 * @param startTwo 
 * @param endTwo 
 * @returns 
 */
export function isTimeClashing(
    startOne: string,
    endOne: string,
    startTwo: string,
    endTwo: string
  ): boolean {
    const toSeconds = (t: string): number => {
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60;
    };

    const s1 = toSeconds(startOne);
    const e1 = toSeconds(endOne);
    const s2 = toSeconds(startTwo);
    const e2 = toSeconds(endTwo);

    // Two ranges collide if each starts before the other ends
    return s1 < e2 && s2 < e1;
  }