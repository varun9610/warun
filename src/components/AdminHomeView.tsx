import React, { useState, useEffect } from "react";
import { db, AuditLog } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { motion } from "motion/react";

interface AdminHomeViewProps {
  onLogout: () => void;
}

export default function AdminHomeView({ onLogout }: AdminHomeViewProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to audit logs real-time from Firestore
    const q = query(collection(db, "logs"), orderBy("time", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AuditLog[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      setLogs(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-8 pt-20 px-4 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">ระบบบริหารจัดการหลังบ้าน (System Administration)</h1>
          <p className="text-xs text-slate-500">หน่วยบริหารเทคโนโลยีสารสนเทศ กองทัพอากาศ</p>
        </div>
        <button onClick={onLogout} className="text-error hover:text-rose-700 flex items-center gap-1 cursor-pointer text-xs font-bold">
          <span className="material-symbols-outlined text-sm">logout</span> ออกจากระบบ
        </button>
      </div>

      {/* Restricted Access Banner */}
      <div className="flex items-center gap-3 bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 shadow-xs">
        <span className="material-symbols-outlined text-rose-600 animate-pulse">lock_person</span>
        <div>
          <p className="font-label text-xs font-bold">พื้นที่หวงห้ามเฉพาะเจ้าหน้าที่ (Admin Only)</p>
          <p className="text-[10px] text-rose-500 uppercase font-semibold mt-0.5">AUTHORIZED ACCESS LOGGED SECURELY</p>
        </div>
      </div>

      {/* Bento Grid: Health Monitor & User Management */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* System Health */}
        <section className="md:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">health_and_safety</span>
              ตรวจสอบสถานะระบบ (System Health)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">อัปเดตแบบเรียลไทม์</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">CORE SERVER</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-display text-lg font-black text-primary">ONLINE</span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">Latency: 12ms</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">DB CONNECTION</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-display text-lg font-black text-primary">99.9%</span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">Active: 1,402</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">STORAGE USAGE</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-display text-lg font-black text-primary">64%</span>
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">Available: 4.2 TB</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200/50 rounded-xl relative overflow-hidden h-20">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
            <div className="flex items-end justify-between h-full gap-1">
              <div className="w-full bg-primary/20 h-1/2"></div>
              <div className="w-full bg-primary/30 h-3/4"></div>
              <div className="w-full bg-primary/25 h-2/3"></div>
              <div className="w-full bg-primary/40 h-full"></div>
              <div className="w-full bg-primary/35 h-5/6"></div>
              <div className="w-full bg-primary/50 h-3/4"></div>
              <div className="w-full bg-primary/45 h-2/3"></div>
              <div className="w-full bg-primary/60 h-full"></div>
            </div>
            <span className="absolute top-2 left-2 text-[10px] font-bold text-primary/60">NETWORK TRAFFIC (24H)</span>
          </div>
        </section>

        {/* User Management summary */}
        <section className="md:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <h3 className="font-display font-bold text-sm text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">manage_accounts</span>
            การจัดการผู้ใช้งาน
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">ผู้ใช้งานทั้งหมด</span>
              <span className="font-bold text-slate-800">12,450</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-emerald-600 font-bold">
              <span>กำลังใช้งาน (Active Sessions)</span>
              <span>482</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">แอดมินระบบ</span>
              <span className="font-bold text-slate-800">14</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ผู้ควบคุมพัสดุ</span>
              <span className="font-bold text-slate-800">156</span>
            </div>
          </div>
          <button 
            onClick={() => alert("ระบบควบคุมสิทธิ์ความปลอดภัย กำลังแสดงรายชื่อผู้ใช้งานทั้งหมด...")}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-xs tracking-wider hover:bg-primary-container transition-all mt-6 cursor-pointer"
          >
            ตรวจสอบผู้ใช้งาน
          </button>
        </section>
      </div>

      {/* Audit Logs & Master Data */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Audit Logs */}
        <section className="md:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">history_edu</span>
              บันทึกการใช้งานระบบ (Audit Logs)
            </h3>
            <button onClick={() => alert("กำลังเปิดประวัติบันทึกแบบเต็ม...")} className="text-xs text-primary font-bold hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200 text-xs text-slate-500 font-bold">
                  <th className="px-3 py-2.5">Time</th>
                  <th className="px-3 py-2.5">User</th>
                  <th className="px-3 py-2.5">Action</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400">กำลังโหลดบันทึก...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400">ไม่มีประวัติบันทึกการใช้งาน</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3 font-semibold text-slate-400">{log.time}</td>
                      <td className="px-3 py-3 font-bold text-slate-700">{log.user}</td>
                      <td className="px-3 py-3 text-slate-600">{log.action}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Master Data */}
        <section className="md:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-primary mb-1">ข้อมูลหลักของระบบ (Master Data)</h3>
            <p className="text-xs text-slate-500">จัดการข้อมูลแกนหลัก ข้อมูลชั้นยศ และรายชื่อหน่วยในกองทัพอากาศ</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => alert("เปิดแผงตั้งค่าประเภทอุปกรณ์พัสดุ")}
              className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 text-left transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
              <div>
                <p className="font-bold text-xs text-slate-800">Equipment Types</p>
                <p className="text-[9px] text-slate-400">ประเภทอุปกรณ์พัสดุ</p>
              </div>
            </button>
            <button 
              onClick={() => alert("เปิดแผงตั้งค่าชั้นยศและตำแหน่ง")}
              className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 text-left transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-xl">military_tech</span>
              <div>
                <p className="font-bold text-xs text-slate-800">Ranks &amp; Titles</p>
                <p className="text-[9px] text-slate-400">ชั้นยศและตำแหน่ง</p>
              </div>
            </button>
            <button 
              onClick={() => alert("เปิดแผงตั้งค่ารายชื่อหน่วยงานในสังกัด")}
              className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 text-left transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-xl">apartment</span>
              <div>
                <p className="font-bold text-xs text-slate-800">Unit Master</p>
                <p className="text-[9px] text-slate-400">รายชื่อหน่วยงานในสังกัด</p>
              </div>
            </button>
            <button 
              onClick={() => alert("เปิดแผงตั้งค่ามาตรฐานใบรับรองความปลอดภัย")}
              className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 text-left transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-xl">description</span>
              <div>
                <p className="font-bold text-xs text-slate-800">Certifications</p>
                <p className="text-[9px] text-slate-400">มาตรฐานใบรับรอง</p>
              </div>
            </button>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200/30 rounded-xl flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-700 text-lg">info</span>
            <p className="text-[10px] text-amber-800 leading-relaxed font-semibold">
              ระวัง: การเปลี่ยนแปลงข้อมูลในส่วนนี้จะส่งผลกระทบต่อระบบคำนวณสถิติและใบรายงานย้อนหลังทั้งหมด
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
