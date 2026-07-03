import React, { useState, useEffect } from "react";
import { db, InventoryItem, RequestItem } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc } from "firebase/firestore";
import { motion } from "motion/react";

interface SupplyHomeViewProps {
  onLogout: () => void;
}

export default function SupplyHomeView({ onLogout }: SupplyHomeViewProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick state for registering new item
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemNsn, setNewItemNsn] = useState("");
  const [newItemQty, setNewItemQty] = useState("10 EA");

  useEffect(() => {
    // Listen to inventory real-time
    const qInv = query(collection(db, "inventory"));
    const unsubscribeInv = onSnapshot(qInv, (snapshot) => {
      const list: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as InventoryItem);
      });
      setInventory(list);
    });

    // Listen to requests real-time
    const qReq = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribeReq = onSnapshot(qReq, (snapshot) => {
      const list: RequestItem[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as RequestItem);
      });
      setRequests(list);
      setLoading(false);
    });

    return () => {
      unsubscribeInv();
      unsubscribeReq();
    };
  }, []);

  const handleRegisterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemNsn) return;

    try {
      const id = "TX-90" + Math.floor(10 + Math.random() * 90);
      const newItem: InventoryItem = {
        id,
        nsn: newItemNsn,
        name: newItemName,
        type: "รับเข้า",
        quantity: newItemQty,
        status: "อนุมัติแล้ว",
        time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      };

      await setDoc(doc(db, "inventory", id), newItem);
      
      // Log to audit trail
      const logId = "LOG-" + Math.floor(1000 + Math.random() * 9000);
      await setDoc(doc(db, "logs", logId), {
        id: logId,
        time: new Date().toLocaleTimeString("th-TH", { hour12: false }),
        user: "supply_officer_hq",
        action: `Registered new inventory: ${newItemName}`,
        status: "SUCCESS"
      });

      alert("ลงทะเบียนพัสดุเข้าคลังสำเร็จ!");
      setShowAddModal(false);
      setNewItemName("");
      setNewItemNsn("");
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเพิ่มพัสดุได้");
    }
  };

  const handleDispatch = async (reqId: string) => {
    try {
      // Update request status to "In Transit" (จัดส่งแล้ว)
      const docRef = doc(db, "requests", reqId);
      await updateDoc(docRef, { status: "In Transit" });

      // Add audit log
      const logId = "LOG-" + Math.floor(1000 + Math.random() * 9000);
      await setDoc(doc(db, "logs", logId), {
        id: logId,
        time: new Date().toLocaleTimeString("th-TH", { hour12: false }),
        user: "supply_officer_hq",
        action: `Dispatched approved request ${reqId} to transit`,
        status: "SUCCESS"
      });

      alert(`จัดเตรียมพัสดุเรียบร้อย! เปลี่ยนสถานะเป็นจัดส่ง (In Transit)`);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedButNotShipped = requests.filter((r) => r.status === "Approved");

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-8 pt-20 px-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">แผงควบคุมเจ้าหน้าที่พัสดุ (Supply Dashboard)</h1>
          <p className="text-xs text-slate-500">ระบบบริหารจัดการพัสดุและการส่งกำลังบำรุง - กองทัพอากาศ</p>
        </div>
        <button onClick={onLogout} className="text-error hover:text-rose-700 flex items-center gap-1 cursor-pointer text-xs font-bold">
          <span className="material-symbols-outlined text-sm">logout</span> ออกจากระบบ
        </button>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500">พัสดุทั้งหมดในคลัง</span>
            <span className="material-symbols-outlined text-primary">inventory_2</span>
          </div>
          <span className="font-display text-3xl font-black text-primary leading-none">12,450</span>
          <p className="text-[10px] text-emerald-600 font-bold mt-3 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">trending_up</span> เพิ่มขึ้น 2.4% จากเดือนที่แล้ว
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-rose-800">พัสดุที่ต้องจัดหาเพิ่ม</span>
            <span className="material-symbols-outlined text-rose-700">warning</span>
          </div>
          <span className="font-display text-3xl font-black text-rose-800 leading-none">18</span>
          <p className="text-[10px] text-rose-700 font-bold mt-3 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">priority_high</span> ต้องการการดำเนินการด่วน
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500">คำร้องรอจัดส่ง / รออนุมัติ</span>
            <span className="material-symbols-outlined text-amber-600">assignment_late</span>
          </div>
          <span className="font-display text-3xl font-black text-primary leading-none">
            {pendingCount + approvedButNotShipped.length}
          </span>
          <p className="text-[10px] text-amber-700 font-bold mt-3 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">info</span> รออนุมัติ {pendingCount} • รอจัดส่ง {approvedButNotShipped.length}
          </p>
        </div>
      </section>

      {/* Grid: Stock Levels & Staff Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stock Level Progress */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-sm text-primary">ระดับสต็อกแยกตามประเภท</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>อะไหล่เครื่องบิน (F-16)</span>
                <span className="font-bold">82%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "82%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>อุปกรณ์สื่อสารนำร่อง</span>
                <span className="font-bold">45%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: "45%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-rose-700 font-bold mb-1">
                <span>ชุดอุปกรณ์ช่วยชีวิตและร่มชูชีพนักบิน (Critical)</span>
                <span>12%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600" style={{ width: "12%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Tools */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="font-display font-bold text-sm text-primary mb-4">เครื่องมือเจ้าหน้าที่</h3>
          <div className="space-y-3">
            <button 
              onClick={() => alert("ระบบกำลังสร้างรายงาน PDF สรุปคลังพัสดุ...")}
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg flex items-center gap-3 font-label text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span>ออกรายงานพัสดุคงคลัง</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg flex items-center gap-3 font-label text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add_box</span>
              <span>ลงทะเบียนพัสดุเข้าใหม่</span>
            </button>
            <button 
              onClick={() => alert("ระบบกำลังเปิดกล้องสแกนบาร์โค้ด (กรุณาให้สิทธิ์กล้องในเบราว์เซอร์)")}
              className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-3 font-label text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
              <span>สแกนบาร์โค้ดตรวจสอบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Dispatch Section */}
      {approvedButNotShipped.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-8 space-y-4">
          <h3 className="font-display font-bold text-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">local_shipping</span>
            คำขอที่อนุมัติแล้ว - รอเจ้าหน้าที่พัสดุจัดเตรียมจัดส่ง ({approvedButNotShipped.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {approvedByNone => null}
            {approvedByNullOrWhat => null}
            {approvedButNotShipped.map((req) => (
              <div key={req.id} className="p-4 bg-sky-50/50 border border-sky-100 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[9px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold uppercase">
                    {req.id}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 mt-1">{req.category} (จำนวน {req.quantity} ชิ้น)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">ผู้ขอ: {req.pilotName} • {req.wing}</p>
                </div>
                <button
                  onClick={() => handleDispatch(req.id)}
                  className="bg-primary text-white py-2 px-3 rounded text-[10px] font-bold tracking-wider hover:bg-primary-container transition-all cursor-pointer"
                >
                  จัดส่งอุปกรณ์
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-display font-bold text-sm text-primary">รายการทำรายการล่าสุด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200 text-xs text-slate-500 font-bold">
                <th className="px-4 py-3">รหัสรายการ</th>
                <th className="px-4 py-3">ชื่อพัสดุ / NSN</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3 text-center">จำนวน</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
                <th className="px-4 py-3 text-right">เวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-bold text-primary">#{item.id}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">NSN: {item.nsn}</div>
                  </td>
                  <td className="px-4 py-4">{item.type}</td>
                  <td className="px-4 py-4 text-center">{item.quantity}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-slate-400">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Inventory Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-display font-bold text-sm text-primary">ลงทะเบียนพัสดุเข้าใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleRegisterItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อพัสดุ</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="เช่น O-Ring Hydraulic, Flight Suit, etc."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-sans"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">รหัสพัสดุ / NSN</label>
                <input
                  type="text"
                  value={newItemNsn}
                  onChange={(e) => setNewItemNsn(e.target.value)}
                  placeholder="5330-01-123-4567"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-sans"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">จำนวนที่รับเข้า</label>
                <input
                  type="text"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  placeholder="e.g. 50 EA"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-sans"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-white font-label text-xs font-bold rounded-lg tracking-wider"
              >
                บันทึกรับพัสดุ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
