export type ClassType = {
  classTypeId: number,
  classType: string,
  classTypeDetails: ClassTypeDetail[],
};

export type ClassTypeDetail = {
  enrollmentSubjectTypeId: number,
  grouping: number,
  dayId: number,
  day: string,
  startTime: string,
  endTime: string,
};
