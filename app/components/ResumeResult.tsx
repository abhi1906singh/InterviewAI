import { ResumeData } from "../types/resume";
import { User, Briefcase, Code, FolderGit2 } from "lucide-react";

type ResumeResultProps = {
  data: ResumeData;
};

export default function ResumeResult({ data }: ResumeResultProps) {
  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      {/* Header Profile */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{data.name || "Candidate Profile"}</h2>
          <p className="text-xs text-gray-500">Parsed and analyzed by AI engine</p>
        </div>
      </div>

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
            <Code className="h-4 w-4 text-indigo-600" />
            <h3>Identified Technical Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span
                key={i}
                className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
            <Briefcase className="h-4 w-4 text-indigo-600" />
            <h3>Work Experience</h3>
          </div>
          <div className="space-y-3">
            {data.experience.map((exp, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {exp.title} <span className="text-gray-500 font-normal">at</span> {exp.company}
                  </h4>
                  {exp.dates && (
                    <span className="text-xs text-gray-500 font-medium mt-0.5 sm:mt-0">
                      {exp.dates}
                    </span>
                  )}
                </div>

                {Array.isArray(exp.description) ? (
                  <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-gray-600">
                    {exp.description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-gray-600">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
            <FolderGit2 className="h-4 w-4 text-indigo-600" />
            <h3>Featured Projects</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.projects.map((p, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                <h4 className="font-semibold text-gray-900 text-sm">{p.name}</h4>
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}