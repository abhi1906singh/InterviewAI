// /types/resume.ts

export type Project = {
  name: string;
  description: string;
};

export type Experience = {
  title: string;
  company: string;
  dates: string;
  description: string[];
};

export type ResumeData = {
  name: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
};

export type ApiResponse = {
  success: boolean;
  data: ResumeData;
};