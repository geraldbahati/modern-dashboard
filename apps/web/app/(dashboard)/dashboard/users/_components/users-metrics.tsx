import { getUserMetrics } from "../_lib/actions";
import { UsersMetricsList } from "./users-metrics-list";

export async function UsersMetrics() {
  const metrics = await getUserMetrics();

  return <UsersMetricsList metrics={metrics} />;
}
