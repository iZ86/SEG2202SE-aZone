export type Programme = {
  programmeId: number;
  programmeName: string;
};

export type ProgrammeIntake = {
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  semester: number,
  semesterStartDate: Date;
  semesterEndDate: Date;
};
