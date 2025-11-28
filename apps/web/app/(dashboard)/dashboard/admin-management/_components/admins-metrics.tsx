import { getAdminMetrics } from "../_lib/actions";
import { AdminsMetricsList } from "./admins-metrics-list";

export async function AdminsMetrics() {
  const metrics = await getAdminMetrics();

  return <AdminsMetricsList metrics={metrics} />;
}
