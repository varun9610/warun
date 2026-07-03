import React, { useState, useEffect } from "react";
import { db, RequestItem } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion } from "motion/react";

interface ExecutiveHomeViewProps {
  onLogout: () => void;
}

export default function ExecutiveHomeView({ onLogout }: ExecutiveHomeViewProps) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to requests real-time
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: RequestItem[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as RequestItem);
      });
      setRequests(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalPilots = 1248;
  const inventoryValue = 42.5;
  const readinessPercent = 98.2;

  // Group or summarize high value requests
  const highValueRequests = requests.filter((r) => r.value >= 300000);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-8 pt-20 px-4 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">แผงควบคุมผู้บริหาร (Executive Dashboard)</h1>
          <p className="text-xs text-slate-500">สถิติภาพรวมและการส่งกำลังบำรุงเชิงลึก - กองทัพอากาศไทย</p>
        </div>
        <button onClick={onLogout} className="text-error hover:text-rose-700 flex items-center gap-1 cursor-pointer text-xs font-bold">
          <span className="material-symbols-outlined text-sm">logout</span> ออกจากระบบ
        </button>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">นักบินที่ให้บริการรวม</span>
            <h2 className="font-display text-2xl font-black text-primary leading-none mt-1">
              {totalPilots} <span className="text-xs font-normal text-slate-500">ราย</span>
            </h2>
          </div>
          <div className="flex items-center text-emerald-600 gap-1 mt-4 text-[10px] font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+4.2% จากเดือนที่แล้ว</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">คำขอรออนุมัติทั้งหมด</span>
            <h2 className="font-display text-2xl font-black text-rose-700 leading-none mt-1">
              {requests.filter((r) => r.status === "Pending").length} <span className="text-xs font-normal text-slate-500">รายการ</span>
            </h2>
          </div>
          <button 
            onClick={() => alert("ระบบได้ยื่นการแจ้งเตือนด่วนไปยังผู้อนุมัติ (Commander) เรียบร้อยแล้ว")}
            className="w-full bg-primary text-white py-1.5 rounded text-[10px] font-bold tracking-wider hover:bg-primary-container transition-all mt-4 cursor-pointer"
          >
            เร่งรัดการอนุมัติ
          </button>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">มูลค่าคงคลังรวม</span>
            <h2 className="font-display text-2xl font-black text-primary leading-none mt-1">
              ฿{inventoryValue}M
            </h2>
          </div>
          <div className="flex items-center text-slate-400 gap-1 mt-4 text-[10px] font-bold">
            <span className="material-symbols-outlined text-sm">update</span>
            <span>อัปเดตแบบเรียลไทม์</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ความพร้อมอุปกรณ์</span>
            <h2 className="font-display text-2xl font-black text-tertiary leading-none mt-1">
              {readinessPercent}%
            </h2>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-tertiary rounded-full" style={{ width: `${readinessPercent}%` }}></div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Distribution Chart */}
        <section className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display font-bold text-sm text-primary">การกระจายอุปกรณ์ตามกองบิน</h3>
            <p className="text-xs text-slate-500 mt-0.5">จำนวนชุดอุปกรณ์ช่วยชีวิตและเซฟตี้ (Egress/Survival) ประจำการในแต่ละหน่วย</p>
          </div>
          <div className="flex items-end justify-around h-48 gap-2 pt-6">
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="bg-primary hover:brightness-110 transition-all rounded-t-sm w-full h-[65%]" title="Wing 1: 320 units"></div>
              <span className="text-[10px] text-slate-400 font-bold">Wing 1</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="bg-primary hover:brightness-110 transition-all rounded-t-sm w-full h-[55%]" title="Wing 2: 270 units"></div>
              <span className="text-[10px] text-slate-400 font-bold">Wing 2</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="bg-amber-400 hover:brightness-110 transition-all rounded-t-sm w-full h-[85%]" title="Wing 4: 450 units"></div>
              <span className="text-[10px] font-black text-primary">Wing 4</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="bg-primary hover:brightness-110 transition-all rounded-t-sm w-full h-[35%]" title="Wing 6: 180 units"></div>
              <span className="text-[10px] text-slate-400 font-bold">Wing 6</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="bg-primary hover:brightness-110 transition-all rounded-t-sm w-full h-[75%]" title="Wing 7: 390 units"></div>
              <span className="text-[10px] text-slate-400 font-bold">Wing 7</span>
            </div>
          </div>
        </section>

        {/* Budget status Card */}
        <section className="lg:col-span-5 bg-primary text-white p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-sm">งบประมาณและความคืบหน้าการเบิกจ่าย</h3>
            <p className="text-xs text-slate-400 mt-0.5">งบประมาณการจัดซื้อวัสดุเซฟตี้นักบินประจำปีงบประมาณปัจจุบัน</p>
          </div>
          <div className="my-6 text-center">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">BUDGET STATUS</span>
            <h4 className="font-display text-2xl font-black mt-1">ภายใต้กรอบงบประมาณ</h4>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-4 text-xs">
            <div>
              <span className="text-slate-400">เบิกจ่ายไปแล้ว</span>
              <p className="font-bold text-sm">฿12.8M</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400">คงเหลือใช้งาน</span>
              <p className="font-bold text-sm text-amber-400">฿4.2M</p>
            </div>
          </div>
        </section>
      </div>

      {/* High Value Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-display font-bold text-sm text-primary">รายการคำขอมูลค่าสูงล่าสุด (฿300K ขึ้นไป)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200 text-xs text-slate-500 font-bold">
                <th className="px-4 py-3">รหัสคำขอ</th>
                <th className="px-4 py-3">รายการอุปกรณ์</th>
                <th className="px-4 py-3 text-center">จำนวน</th>
                <th className="px-4 py-3">กองบิน</th>
                <th className="px-4 py-3 text-right">มูลค่ารวม (฿)</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : highValueRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">ไม่มีรายการคำขอมูลค่าสูง</td>
                </tr>
              ) : (
                highValueRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-4 font-bold text-primary">{req.id}</td>
                    <td className="px-4 py-4 font-bold text-slate-800">{req.category} for pilots</td>
                    <td className="px-4 py-4 text-center">{req.quantity}</td>
                    <td className="px-4 py-4">{req.wing}</td>
                    <td className="px-4 py-4 text-right font-semibold">{req.value.toLocaleString()}</td>
                    <td className="px-md py-4 text-center">
                      <span
                        className={`status-pill ${
                          req.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : req.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {req.status === "Pending"
                          ? "รอการอนุมัติ"
                          : req.status === "Approved"
                          ? "อนุมัติแล้ว"
                          : "กำลังขนส่ง"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
