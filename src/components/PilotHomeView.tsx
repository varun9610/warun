import React, { useState, useEffect } from "react";
import { RequestItem } from "../types";
import { db, RequestItem as FBRequestItem } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion } from "motion/react";

interface PilotHomeViewProps {
  username: string;
  onNewRequest: () => void;
  onLogout: () => void;
}

export default function PilotHomeView({ username, onNewRequest, onLogout }: PilotHomeViewProps) {
  const [activeTab, setActiveTab] = useState<"home" | "requests" | "inventory" | "reports">("home");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read requests in real-time from Firestore
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: RequestItem[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as RequestItem);
      });
      setRequests(list.filter((r) => r.pilotName.includes("สมชาย") || r.pilotName.includes("somchai")));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleExportReport = () => {
    alert("รายงานอุปกรณ์ส่วนบุคคลได้รับการสร้างและส่งออกไปยังอีเมล RTAF ของท่านเรียบร้อยแล้ว");
  };

  const myAssignedGear = [
    { name: "HGU-55/P Flight Helmet", serial: "SN-RTAF-9902", status: "หมดอายุการตรวจ (Expired)", statusColor: "text-error" },
    { name: "MBU-20/P Oxygen Mask", serial: "SN-RTAF-8812", status: "พร้อมใช้งาน (Normal)", statusColor: "text-green-600" },
    { name: "CSU-13B/P G-Suit", serial: "SN-RTAF-4122", status: "พร้อมใช้งาน (Normal)", statusColor: "text-green-600" },
    { name: "LPU-9/P Life Preserver", serial: "SN-RTAF-0391", status: "พร้อมใช้งาน (Normal)", statusColor: "text-green-600" },
    { name: "SRU-21/P Survival Vest", serial: "SN-RTAF-1104", status: "พร้อมใช้งาน (Normal)", statusColor: "text-green-600" }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-8">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-primary leading-none">RTAF PEMS</h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider">PILOT CONSOLE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert("ไม่มีการแจ้งเตือนใหม่ในขณะนี้")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-slate-600">notifications</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-error transition-colors cursor-pointer"
            title="ออกจากระบบ"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Welcome Hero Section */}
            <section className="relative overflow-hidden rounded-2xl bg-primary text-white p-6 shadow-md mt-4">
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-container rounded-full blur-3xl opacity-40"></div>
              <div className="relative z-10">
                <span className="text-[10px] font-bold tracking-widest text-sky-300 uppercase">กองทัพอากาศไทย</span>
                <h2 className="font-display text-2xl font-bold mt-1 mb-2">ยินดีต้อนรับ, น.ท. สมชาย รักชาติ</h2>
                <p className="text-slate-300 text-xs leading-relaxed max-w-lg">
                  ระบบบริหารจัดการอุปกรณ์ส่วนตัวและพัสดุนิรภัยของนักบิน เข้าถึงข้อมูลเพื่อยื่นคำขอเบิก ตรวจสอบสถานะการตรวจสอบความปลอดภัย และการส่งกำลังบำรุง
                </p>
              </div>
            </section>

            {/* Quick Actions Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-primary mb-3">
                <span className="material-symbols-outlined">rocket_launch</span>
                <h3 className="font-display font-bold text-sm">ดำเนินการด่วน</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">ทำรายการเบิกชุดพัสดุสำหรับภารกิจบินใหม่ หรือส่งออกไฟล์รายงานอุปกรณ์ปัจจุบัน</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onNewRequest}
                  className="bg-primary text-white py-3 px-4 rounded-lg font-bold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-primary-container transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  NEW REQUEST
                </button>
                <button
                  onClick={handleExportReport}
                  className="border border-slate-300 text-slate-700 bg-white py-3 px-4 rounded-lg font-bold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">file_upload</span>
                  EXPORT REPORT
                </button>
              </div>
            </div>

            {/* Summary KPI grid & Active Requests */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Requests List */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="font-display font-bold text-sm text-primary mb-4 flex items-center justify-between">
                  <span>รายการคำร้องปัจจุบัน (Active Requests)</span>
                  <span className="text-[10px] bg-sky-100 text-primary px-2.5 py-0.5 rounded-full font-bold">
                    {requests.length} รายการ
                  </span>
                </h3>
                {loading ? (
                  <div className="text-center py-6 text-slate-400 text-xs">กำลังโหลดข้อมูล...</div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    ไม่มีรายการคำขอเบิกในขณะนี้
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                            req.category === "Helmet"
                              ? "bg-amber-100 text-tertiary"
                              : req.category === "G-Suit"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-teal-100 text-teal-700"
                          }`}>
                            <span className="material-symbols-outlined text-lg">
                              {req.category === "Helmet"
                                ? "engineering"
                                : req.category === "G-Suit"
                                ? "apparel"
                                : "air"}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{req.category} Request</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">REQ #{req.id} • {new Date(req.createdAt).toLocaleDateString("th-TH")}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : req.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "In Transit"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {req.status === "Pending"
                              ? "Pending"
                              : req.status === "Approved"
                              ? "Approved"
                              : req.status === "In Transit"
                              ? "In Transit"
                              : "Rejected"}
                          </span>
                          {req.comments && (
                            <span className="text-[9px] text-slate-400 max-w-[120px] truncate" title={req.comments}>
                              โน้ต: {req.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* KPI Counter Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between text-center items-center">
                <div className="space-y-1">
                  <span className="font-display text-5xl font-black text-primary leading-none block">05</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">My Equipment</span>
                </div>
                <div className="w-full mt-6">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                    <span>ความครบถ้วนอุปกรณ์</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Alerts & Supply Depot image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Table */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-sm text-error flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>report_problem</span>
                    การแจ้งเตือนการบำรุงรักษา (Maintenance Alerts)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-2.5 text-xs font-bold text-slate-400 uppercase">อุปกรณ์</th>
                        <th className="py-2.5 text-xs font-bold text-slate-400 uppercase">หมายเลขซีเรียล</th>
                        <th className="py-2.5 text-xs font-bold text-slate-400 uppercase">วันหมดอายุ</th>
                        <th className="py-2.5 text-xs font-bold text-slate-400 uppercase text-right">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100 text-xs">
                        <td className="py-3 font-semibold text-slate-800">HGU-55/P Helmet</td>
                        <td className="py-3 text-slate-500">SN-RTAF-9902</td>
                        <td className="py-3 text-slate-500">15 พ.ค. 2024</td>
                        <td className="py-3 text-right">
                          <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            EXPIRED
                          </span>
                        </td>
                      </tr>
                      <tr className="text-xs">
                        <td className="py-3 font-semibold text-slate-800">MBU-20/P Oxygen Mask</td>
                        <td className="py-3 text-slate-500">SN-RTAF-8812</td>
                        <td className="py-3 text-slate-500">12 ธ.ค. 2026</td>
                        <td className="py-3 text-right">
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            NORMAL
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Image Depot context card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between group">
                <div 
                  className="w-full h-32 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhCpAOqFS6AFKR53kAxOTLke_-_jvueiADDViD7o8NYs8WV5MTAXNfA9T3VbMhR7gAqV4g4Nn4Rw_pQ6RNJrrlF61_0rIZ0gH7yGs36g_ED0kluHUZVCJPSk1prIUAoyfFunnn3xINzX8lLZcNFBJnh9OA_YComRsHKQVrEN7E-NA8EMNN66jA8AZsiP_sGxN7SPrSAwaJmNJtZPNDeftcAP8bPyZiQKK1-G04bHa35Oy2Gw7va6bCnJ6fSRZJ_LI8M4wcIg0Ei28')` }}
                ></div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <p className="font-bold text-xs text-primary">คลังพัสดุสนับสนุน (Supply Depot)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">กองบิน 1, นครราชสีมา</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "requests" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 mt-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-display text-xl font-bold text-primary">ประวัติการเบิกอุปกรณ์</h2>
                <p className="text-xs text-slate-500">ตรวจสอบและติดตามสถานะคำร้องขออุปกรณ์ทั้งหมด</p>
              </div>
              <button
                onClick={onNewRequest}
                className="bg-primary text-white py-2 px-4 rounded-lg font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 hover:bg-primary-container transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                สร้างคำขอใหม่
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">ไม่มีรายการประวัติคำขอ</div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          REQ #{req.id}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 mt-1.5">คำขออุปกรณ์: {req.category} (จำนวน {req.quantity} ชิ้น)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">ส่งเมื่อ: {new Date(req.createdAt).toLocaleString("th-TH")}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : req.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "In Transit"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 border-t border-slate-200/50 pt-2 space-y-1">
                      <p><strong className="text-slate-800">เหตุผลในการเบิก:</strong> {req.reason}</p>
                      {req.comments && (
                        <p className="text-amber-700 bg-amber-50 p-2 rounded border border-amber-200/30 mt-1">
                          <strong className="font-bold">บันทึกจากเจ้าหน้าที่/ผู้อนุมัติ:</strong> {req.comments}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Inventory */}
        <section class="step-transition step-hidden" id="step-inventory">
          {/* We will handle tab toggles via standard React rendering */}
        </section>
        
        {/* Render content based on current view/tab selection */}
        {activeTab === "inventory" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 mt-4"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-primary">อุปกรณ์ประจำตัวของฉัน (My Assigned Gear)</h2>
              <p className="text-xs text-slate-500">ตรวจสอบรายการและวันหมดอายุการตรวจสอบของพัสดุที่ท่านครอบครองอยู่</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              {myAssignedGear.map((gear, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-lg">
                      security
                    </span>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{gear.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">S/N: {gear.serial}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${gear.statusColor}`}>{gear.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 mt-4"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-primary">รายงานและเอกสารอ้างอิง</h2>
              <p className="text-xs text-slate-500">เข้าถึงเอกสารคู่มือความปลอดภัย และดาวน์โหลดรายงานสรุปการตรวจเช็คพัสดุ</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-3">
                <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
                <h4 className="font-bold text-sm text-slate-800">คู่มือความปลอดภัยการบิน ทอ.</h4>
                <p className="text-xs text-slate-400">ระเบียบปฏิบัติและระยะเวลาการตรวจสภาพอุปกรณ์ช่วยชีวิต (Egress/Survival)</p>
                <button 
                  onClick={() => alert("ดาวน์โหลดคู่มือเรียบร้อยแล้ว")}
                  className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  ดาวน์โหลดคู่มือ (PDF) <span className="material-symbols-outlined text-xs">download</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-3">
                <span className="material-symbols-outlined text-primary text-3xl">assignment_turned_in</span>
                <h4 className="font-bold text-sm text-slate-800">รายงานการตรวจสภาพประจำปี</h4>
                <p className="text-xs text-slate-400">สรุปใบรับรองความพร้อมและผลการตรวจสอบอุปกรณ์นิรภัยส่วนบุคคลล่าสุด</p>
                <button 
                  onClick={() => alert("ดาวน์โหลดเอกสารการรับรองเรียบร้อยแล้ว")}
                  className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  ดาวน์โหลดใบรับรอง (PDF) <span className="material-symbols-outlined text-xs">download</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-2 pb-safe bg-white border-t border-slate-200 shadow-lg">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200 rounded-2xl cursor-pointer ${
            activeTab === "home"
              ? "bg-primary/10 text-primary font-bold"
              : "text-slate-500 hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined mb-0.5" style={{ fontVariationSettings: activeTab === "home" ? "'FILL' 1" : "" }}>home</span>
          <span className="font-label text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200 rounded-2xl cursor-pointer ${
            activeTab === "requests"
              ? "bg-primary/10 text-primary font-bold"
              : "text-slate-500 hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined mb-0.5" style={{ fontVariationSettings: activeTab === "requests" ? "'FILL' 1" : "" }}>assignment</span>
          <span className="font-label text-[10px]">Requests</span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200 rounded-2xl cursor-pointer ${
            activeTab === "inventory"
              ? "bg-primary/10 text-primary font-bold"
              : "text-slate-500 hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined mb-0.5" style={{ fontVariationSettings: activeTab === "inventory" ? "'FILL' 1" : "" }}>inventory_2</span>
          <span className="font-label text-[10px]">Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200 rounded-2xl cursor-pointer ${
            activeTab === "reports"
              ? "bg-primary/10 text-primary font-bold"
              : "text-slate-500 hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined mb-0.5" style={{ fontVariationSettings: activeTab === "reports" ? "'FILL' 1" : "" }}>analytics</span>
          <span className="font-label text-[10px]">Reports</span>
        </button>
      </nav>
    </div>
  );
}
