const studentIdRegex = new RegExp("^[0-9]{8}$");

export default function isStudentId(studentId: string) {
  return studentIdRegex.test(studentId);
}
