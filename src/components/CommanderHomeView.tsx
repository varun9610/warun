import React, { useState, useEffect } from "react";
import { db, RequestItem } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc } from "firebase/firestore";
import { motion } from "motion/react";

interface CommanderHomeViewProps {
  onLogout: () => void;
}

export default function CommanderHomeView({ onLogout }: CommanderHomeViewProps) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Read requests in real-time from Firestore
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

  const handleApprove = async (reqId: string) => {
    try {
      const commentText = comments[reqId] || "อนุมัติสำหรับการเบิกอุปกรณ์ทดแทน";
      const docRef = doc(db, "requests", reqId);
      
      // Update status and comment
      await updateDoc(docRef, {
        status: "Approved",
        comments: commentText,
        approvedBy: "น.อ. สุรชัย ผู้บังคับการกองบิน 4"
      });

      // Add to log
      const logId = "LOG-" + Math.floor(1000 + Math.random() * 9000);
      await setDoc(doc(db, "logs", logId), {
        id: logId,
        time: new Date().toLocaleTimeString("th-TH", { hour12: false }),
        user: "commander_wing4",
        action: `Approved Request ${reqId}`,
        status: "SUCCESS"
      });

      alert(`อนุมัติคำขอ ${reqId} เรียบร้อยแล้ว`);
      // Clear specific comment input
      setComments({ ...comments, [reqId]: "" });
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถอนุมัติคำขอได้");
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      const reason = comments[reqId];
      if (!reason) {
        alert("กรุณาระบุเหตุผลในการไม่อนุมัติในช่องแสดงความคิดเห็น");
        return;
      }

      const docRef = doc(db, "requests", reqId);
      await updateDoc(docRef, {
        status: "Rejected",
        comments: reason
      });

      // Add audit log
      const logId = "LOG-" + Math.floor(1000 + Math.random() * 9000);
      await setDoc(doc(db, "logs", logId), {
        id: logId,
        time: new Date().toLocaleTimeString("th-TH", { hour12: false }),
        user: "commander_wing4",
        action: `Rejected Request ${reqId}: ${reason}`,
        status: "SUCCESS"
      });

      alert(`ไม่อนุมัติคำขอ ${reqId} เรียบร้อยแล้ว`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentChange = (reqId: string, val: string) => {
    setComments({ ...comments, [reqId]: val });
  };

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const processedRequests = requests.filter((r) => r.status !== "Pending");

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-20 px-4 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">การพิจารณาอนุมัติคำขอ (Commander Console)</h1>
          <p className="text-xs text-slate-500">ผู้อนุมัติ (Commander) • อนุมัติ / ไม่อนุมัติคำขอเบิกจ่ายอุปกรณ์นิรภัยและพัสดุ</p>
        </div>
        <button onClick={onLogout} className="text-error hover:text-rose-700 flex items-center gap-1 cursor-pointer text-xs font-bold">
          <span className="material-symbols-outlined text-sm">logout</span> ออกจากระบบ
        </button>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pending Requests */}
        <section className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-display font-bold text-sm text-primary flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-amber-500">pending_actions</span>
            รายการคำขอรอการอนุมัติ ({pendingRequests.length})
          </h3>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs">กำลังโหลดข้อมูล...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              ไม่มีคำขอรออนุมัติในขณะนี้
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        REQ #{req.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 mt-1">
                        เบิก {req.category} (จำนวน {req.quantity} ชิ้น)
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        ผู้ส่งคำขอ: {req.rank} {req.pilotName} • {req.wing}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary">มูลค่า: ฿{req.value.toLocaleString()}</span>
                  </div>

                  <div className="text-xs text-slate-600 border-y border-slate-200/50 py-2.5">
                    <p className="font-bold text-slate-800 mb-0.5">เหตุผลความจำเป็น:</p>
                    <p className="italic bg-white p-2 rounded border border-slate-100">{req.reason}</p>
                  </div>

                  {/* Comment & Actions */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="ระบุข้อความอนุมัติ หรือเหตุผลที่ไม่อนุมัติ..."
                      value={comments[req.id] || ""}
                      onChange={(e) => handleCommentChange(req.id, e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none text-xs"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 py-1.5 px-4 rounded font-bold text-[10px] tracking-wider transition-all cursor-pointer"
                      >
                        ไม่อนุมัติ (REJECT)
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="bg-primary text-white hover:bg-primary-container py-1.5 px-4 rounded font-bold text-[10px] tracking-wider transition-all cursor-pointer shadow-xs"
                      >
                        อนุมัติคำขอ (APPROVE)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Processed/Decided History */}
        <section className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-display font-bold text-sm text-primary">ประวัติการพิจารณาคำขอล่าสุด</h3>
          <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1">
            {processedRequests.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">ไม่มีประวัติการพิจารณา</div>
            ) : (
              processedRequests.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-[10px] text-slate-400">{req.id}</span>
                      <h4 className="font-bold text-slate-800 mt-0.5">{req.category}</h4>
                      <p className="text-[9px] text-slate-400">ผู้ขอ: {req.pilotName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      req.status === "Approved" || req.status === "In Transit"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {req.status === "In Transit" ? "Approved" : req.status}
                    </span>
                  </div>
                  {req.comments && (
                    <p className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                      โน้ต: {req.comments}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
