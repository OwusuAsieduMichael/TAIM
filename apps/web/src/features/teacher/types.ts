/** Teacher workspace routes: `/app/dashboard/attendance` etc. */
export type TeacherSection = 'attendance' | 'reports' | 'results' | 'settings';

export type TeacherWorkspaceStudent = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
};

export type TeacherWorkspaceTerm = {
  id: string;
  name: string;
  order: number;
};

export type TeacherWorkspaceAssignment = {
  assignmentId: string;
  classId: string;
  className: string;
  classLevel: string | null;
  subjectId: string;
  subjectName: string;
  subjectCode: string | null;
  academicYearId: string | null;
  academicYearName: string | null;
  terms: TeacherWorkspaceTerm[];
  students: TeacherWorkspaceStudent[];
};

/** One school class with roster (for class dropdown; sorted KG1 → JHS3 on the API). */
export type TeacherWorkspaceClass = {
  id: string;
  name: string;
  level: string | null;
  students: TeacherWorkspaceStudent[];
};

export type TeacherWorkspaceResponse = {
  data: TeacherWorkspaceAssignment[];
  /** All classes in the teacher's school (sorted KG1 → JHS3 when returned by the API). */
  classes?: TeacherWorkspaceClass[];
};
