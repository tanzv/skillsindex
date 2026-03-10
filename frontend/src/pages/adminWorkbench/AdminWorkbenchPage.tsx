import { ConsoleWorkbench } from "../accountWorkbench/ConsoleWorkbench";
import { adminWorkbenchCatalogDefinitions } from "./AdminWorkbenchDefinitionsCatalog";
import { adminWorkbenchGovernanceDefinitions } from "./AdminWorkbenchDefinitionsGovernance";
import { adminWorkbenchOpsDefinitions } from "./AdminWorkbenchDefinitionsOps";
import type { AdminRoute, AdminWorkbenchDefinitionMap } from "./AdminWorkbenchTypes";

export type { AdminRoute } from "./AdminWorkbenchTypes";

interface AdminWorkbenchPageProps {
  route: AdminRoute;
}

const adminWorkbenchDefinitions: AdminWorkbenchDefinitionMap = {
  ...adminWorkbenchCatalogDefinitions,
  ...adminWorkbenchOpsDefinitions,
  ...adminWorkbenchGovernanceDefinitions
};

export default function AdminWorkbenchPage({ route }: AdminWorkbenchPageProps) {
  return <ConsoleWorkbench definition={adminWorkbenchDefinitions[route]} scope="admin" />;
}
