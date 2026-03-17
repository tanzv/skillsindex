export interface AccessAccountItem {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  forceLogoutAt: string;
}

export interface AdminAccessGovernanceData {
  accounts: AccessAccountItem[];
  accountsTotal: number;
  allowRegistration: boolean;
  enabledProviders: string[];
  availableProviders: string[];
}

export interface MetricItem {
  label: string;
  value: number | string;
}
