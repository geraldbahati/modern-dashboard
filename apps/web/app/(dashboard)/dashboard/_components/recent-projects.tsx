import { Download } from "lucide-react";

const projects = [
  {
    name: "E-Commerce Platform",
    status: "Ready",
    date: "11/17/2025",
    color: "bg-green-500/20 text-green-400",
  },
  {
    name: "Mobile App (iOS)",
    status: "Ready",
    date: "11/17/2025",
    color: "bg-green-500/20 text-green-400",
  },
  {
    name: "Dashboard Analytics",
    status: "In Progress",
    date: "11/17/2025",
    color: "bg-yellow-500/20 text-yellow-400",
  },
];

export default function RecentProjects() {
  return (
    <div className="bg-[#111] rounded-3xl p-6 border border-white/5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Projects</h3>
          <p className="text-sm text-gray-500">
            Overview of active development
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 border-b border-white/5">
            <tr>
              <th className="pb-3 font-normal">Name</th>
              <th className="pb-3 font-normal">Status</th>
              <th className="pb-3 font-normal">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map((project, i) => (
              <tr key={i} className="group hover:bg-white/5 transition-colors">
                <td className="py-4 font-medium">{project.name}</td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${project.color}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="py-4 text-gray-400">{project.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
