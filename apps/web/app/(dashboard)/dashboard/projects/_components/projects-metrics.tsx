import { getProjectMetrics } from "../_lib/actions";
import { ProjectsMetricsList } from "./projects-metrics-list";

export async function ProjectsMetrics() {
  const metrics = await getProjectMetrics();

  return <ProjectsMetricsList metrics={metrics} />;
}
