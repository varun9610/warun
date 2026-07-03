import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "total-vortex-qfs6l",
  appId: "1:889911483035:web:f2e3d946e63b00eadbc43e",
  apiKey: "AIzaSyBcogpgP9ArWQankqRnp-0gteogG4uv_mc",
  authDomain: "total-vortex-qfs6l.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-eea936c0-ae59-48ce-9fa3-254b952b1278",
  storageBucket: "total-vortex-qfs6l.firebasestorage.app",
  messagingSenderId: "889911483035"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

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

// Initial Mock Data to Seed
const initialRequests: RequestItem[] = [
  {
    id: "RQ-2024-089",
    pilotName: "น.ท. สมชาย รักชาติ",
    rank: "น.ท.",
    category: "G-Suit",
    quantity: 1,
    reason: "G-Suit Inspection and standard cert testing",
    status: "Pending",
    createdAt: "2026-07-01T21:45:00Z",
    wing: "กองบิน 4",
    value: 450000
  },
  {
    id: "RQ-2024-087",
    pilotName: "น.ต. สมศักดิ์ ดีเลิศ",
    rank: "น.ต.",
    category: "Helmet",
    quantity: 1,
    reason: "New Helmet Liner fitment and HUD adjustment",
    status: "In Transit",
    createdAt: "2026-07-01T18:12:00Z",
    wing: "กองบิน 1",
    value: 1200000
  },
  {
    id: "RQ-2024-085",
    pilotName: "น.ท. สมชาย รักชาติ",
    rank: "น.ท.",
    category: "Oxygen Mask",
    quantity: 2,
    reason: "Bailout oxygen bottle standard cycle replacement",
    status: "Approved",
    createdAt: "2026-06-30T10:30:00Z",
    wing: "กองบิน 7",
    value: 380000
  }
];

const initialInventory: InventoryItem[] = [
  {
    id: "TX-9082",
    nsn: "5330-01-123-4567",
    name: "O-Ring, Hydraulic Seal",
    type: "เบิกออก",
    quantity: "24 EA",
    status: "อนุมัติแล้ว",
    time: "09:45"
  },
  {
    id: "TX-9081",
    nsn: "8415-01-518-4592",
    name: "Flight Suit, Size XL",
    type: "รับเข้า",
    quantity: "50 EA",
    status: "อนุมัติแล้ว",
    time: "08:12"
  },
  {
    id: "TX-9080",
    nsn: "5925-00-058-2941",
    name: "Circuit Breaker, 15A",
    type: "เบิกออก",
    quantity: "02 EA",
    status: "รอดำเนินการ",
    time: "เมื่อวานนี้"
  },
  {
    id: "TX-9079",
    nsn: "2915-01-209-3851",
    name: "Engine Filter Element",
    type: "รับเข้า",
    quantity: "12 EA",
    status: "อนุมัติแล้ว",
    time: "เมื่อวานนี้"
  }
];

const initialLogs: AuditLog[] = [
  {
    id: "LOG-001",
    time: "14:15:22",
    user: "admin_01",
    action: "Updated Equipment #EQ-992",
    status: "SUCCESS"
  },
  {
    id: "LOG-002",
    time: "14:12:05",
    user: "user_mgmt_hq",
    action: "Sync session with otp.rtaf.mi.th: pilot_j_04",
    status: "SUCCESS"
  },
  {
    id: "LOG-003",
    time: "14:05:41",
    user: "sys_monitor",
    action: "Unauthorized Login Attempt",
    status: "FAILED"
  },
  {
    id: "LOG-004",
    time: "13:58:12",
    user: "admin_02",
    action: "Deleted Archive Log: 2023_Q3",
    status: "SUCCESS"
  }
];

// Seed initial data into Firestore if database is empty
export async function seedInitialData() {
  try {
    const requestsCol = collection(db, "requests");
    const requestsSnapshot = await getDocs(requestsCol);

    if (requestsSnapshot.empty) {
      console.log("Seeding requests...");
      const batch = writeBatch(db);
      initialRequests.forEach((req) => {
        const docRef = doc(db, "requests", req.id);
        batch.set(docRef, req);
      });
      await batch.commit();
    }

    const inventoryCol = collection(db, "inventory");
    const inventorySnapshot = await getDocs(inventoryCol);

    if (inventorySnapshot.empty) {
      console.log("Seeding inventory...");
      const batch = writeBatch(db);
      initialInventory.forEach((item) => {
        const docRef = doc(db, "inventory", item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
    }

    const logsCol = collection(db, "logs");
    const logsSnapshot = await getDocs(logsCol);

    if (logsSnapshot.empty) {
      console.log("Seeding audit logs...");
      const batch = writeBatch(db);
      initialLogs.forEach((log) => {
        const docRef = doc(db, "logs", log.id);
        batch.set(docRef, log);
      });
      await batch.commit();
    }

    // Seed overall counts and settings if not present
    const settingsDocRef = doc(db, "settings", "global");
    await setDoc(
      settingsDocRef,
      {
        totalItems: 12450,
        reorderAlerts: 18,
        pendingApprovals: 7,
        executiveValue: 42.5,
        systemHealth: {
          coreServer: "ONLINE",
          dbConnection: "99.9%",
          storageUsage: "64%"
        }
      },
      { merge: true }
    );

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding initial Firebase data:", error);
  }
}
