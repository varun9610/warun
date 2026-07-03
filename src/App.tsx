import React, { useState, useEffect } from "react";
import { UserRole, UserProfile } from "./types";
import { seedInitialData } from "./lib/firebase";
import LoginView from "./components/LoginView";
import PilotHomeView from "./components/PilotHomeView";
import PilotRequestView from "./components/PilotRequestView";
import SupplyHomeView from "./components/SupplyHomeView";
import ExecutiveHomeView from "./components/ExecutiveHomeView";
import AdminHomeView from "./components/AdminHomeView";
import CommanderHomeView from "./components/CommanderHomeView";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "request-stepper">("dashboard");

  useEffect(() => {
    // Seed the database on load if collections are empty
    seedInitialData();
  }, []);

  const handleLogin = (role: UserRole, username: string) => {
    let name = "เจ้าหน้าที่ทั่วไป";
    let rank = "";
    let wing = "กองบิน 4";

    if (role === "pilot") {
      name = "น.ท. สมชาย รักชาติ";
      rank = "น.ท.";
      wing = "กองบิน 4 (ตาคลี)";
    } else if (role === "supply") {
      name = "ร.อ. สมชาย ใจดี";
      rank = "ร.อ.";
      wing = "แผนกพัสดุ ส่วนกลาง";
    } else if (role === "commander") {
      name = "น.อ. สุรชัย พลบิน";
      rank = "น.อ.";
      wing = "กองบิน 4 (ตาคลี)";
    } else if (role === "executive") {
      name = "พล.อ.อ. ประสงค์ รักบิน";
      rank = "พล.อ.อ.";
      wing = "กองทัพอากาศ";
    } else if (role === "admin") {
      name = "เจ้าหน้าที่ฝ่ายไอที";
      rank = "ร.ท.";
      wing = "ศูนย์เทคโนโลยีสารสนเทศ ทอ.";
    }

    setUser({
      username,
      name,
      rank,
      role,
      wing
    });
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen("dashboard");
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Route based on logged in role
  if (user.role === "pilot") {
    if (currentScreen === "request-stepper") {
      return <PilotRequestView onBack={() => setCurrentScreen("dashboard")} />;
    }
    return (
      <PilotHomeView
        username={user.username}
        onNewRequest={() => setCurrentScreen("request-stepper")}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === "supply") {
    return <SupplyHomeView onLogout={handleLogout} />;
  }

  if (user.role === "executive") {
    return <ExecutiveHomeView onLogout={handleLogout} />;
  }

  if (user.role === "admin") {
    return <AdminHomeView onLogout={handleLogout} />;
  }

  if (user.role === "commander") {
    return <CommanderHomeView onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-sm">
        <h2 className="text-lg font-bold text-red-600 mb-2">ไม่พบบทบาทผู้ใช้งาน</h2>
        <p className="text-xs text-slate-500 mb-4">ไม่พบบทบาทที่ตรงกับบัญชีผู้ใช้ของท่าน กรุณาลองใหม่อีกครั้ง</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-xs">
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}
