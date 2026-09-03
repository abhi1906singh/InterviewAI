export type Project = {
  name: string;
  description: string;
};

export type Experience = {
  title: string;
  company: string;
  dates: string;
  description: string[] | string;
};

export type ResumeData = {
  id?: string;
  name: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
};

export type ApiResponse = {
  success: boolean;
  data: ResumeData;
  resumeId?: string;
};