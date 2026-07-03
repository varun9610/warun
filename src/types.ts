export type UserRole = "pilot" | "supply" | "commander" | "executive" | "admin";

export interface UserProfile {
  username: string;
  name: string;
  rank: string;
  role: UserRole;
  wing: string;
  avatarUrl?: string;
}

export interface RequestItem {
  id: string;
  pilotName: string;
  rank: string;
  category: "Helmet" | "G-Suit" | "Oxygen Mask";
  quantity: number;
  reason: string;
  status: "Pending" | "Approved" | "In Transit" | "Rejected";
  createdAt: string;
  wing: string;
  value: number;
  comments?: string;
  approvedBy?: string;
}

export interface InventoryItem {
  id: string;
  nsn: string;
  name: string;
  type: string;
  quantity: string;
  status: string;
  time: string;
}

export interface AuditLog {
  id: string;
  time: string;
  user: string;
  action: string;
  status: "SUCCESS" | "FAILED";
}
