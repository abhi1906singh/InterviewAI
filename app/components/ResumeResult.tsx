export default function ResumeResult({ data }: any) {
  return (
    <div className="mt-6 space-y-6">

      <h2 className="text-xl font-bold">{data.name}</h2>

      {/* Skills */}
      <div>
        <h3 className="font-semibold">Skills</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.skills.map((skill: string, i: number) => (
            <span key={i} className="bg-gray-200 px-3 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div>
        <h3 className="font-semibold">Projects</h3>
        {data.projects.map((p: any, i: number) => (
          <div key={i} className="border p-3 rounded mt-2">
            <h4 className="font-bold">{p.name}</h4>
            <p className="text-sm">{p.description}</p>
          </div>
        ))}
      </div>

      {/* Experience */}
      <div>
        <h3 className="font-semibold">Experience</h3>
        {data.experience.map((exp: any, i: number) => (
          <div key={i} className="border p-3 rounded mt-2">
            <h4 className="font-bold">
              {exp.title} - {exp.company}
            </h4>
            <p className="text-sm">{exp.dates}</p>
            <p className="text-sm">{exp.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
}