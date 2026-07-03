import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { motion } from "motion/react";

interface PilotRequestViewProps {
  onBack: () => void;
}

export default function PilotRequestView({ onBack }: PilotRequestViewProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<"Helmet" | "G-Suit" | "Oxygen Mask">("Helmet");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const randomId = "RQ-2024-" + Math.floor(100 + Math.random() * 900);
      const newRequest = {
        id: randomId,
        pilotName: "น.ท. สมชาย รักชาติ",
        rank: "น.ท.",
        category,
        quantity,
        reason: reason || "Standard replacement and mission outfitting request.",
        status: "Pending",
        createdAt: new Date().toISOString(),
        wing: "กองบิน 4",
        value: category === "Helmet" ? 1200000 * quantity : category === "G-Suit" ? 450000 * quantity : 190000 * quantity
      };

      // Add to Firestore database
      await setDoc(doc(db, "requests", randomId), newRequest);
      
      // Also add to audit logs in Firestore
      const logId = "LOG-" + Math.floor(1000 + Math.random() * 9000);
      await setDoc(doc(db, "logs", logId), {
        id: logId,
        time: new Date().toLocaleTimeString("th-TH", { hour12: false }),
        user: "somchai_rtaf",
        action: `Created Request ${randomId} for ${category}`,
        status: "SUCCESS"
      });

      alert(`ยื่นคำขอเรียบร้อยแล้ว! หมายเลขคำขอของท่านคือ: ${randomId}`);
      onBack();
    } catch (error) {
      console.error("Error creating request:", error);
      alert("เกิดข้อผิดพลาดในการสร้างคำขอ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-20 px-4 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-slate-600 hover:text-primary flex items-center gap-1 cursor-pointer">
          <span className="material-symbols-outlined text-sm">arrow_back</span> ย้อนกลับ
        </button>
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">NEW GEAR REQUEST</span>
      </div>

      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -z-10 -translate-y-1/2"></div>
          {/* Step 1 Indicator */}
          <div className="flex flex-col items-center gap-1 bg-slate-50 px-2 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
              step >= 1 ? "bg-primary text-white border-primary" : "bg-slate-200 text-slate-500 border-slate-200"
            }`}>
              1
            </div>
            <span className={`text-[10px] font-semibold ${step >= 1 ? "text-primary" : "text-slate-400"}`}>Equipment</span>
          </div>
          {/* Step 2 Indicator */}
          <div className="flex flex-col items-center gap-1 bg-slate-50 px-2 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
              step >= 2 ? "bg-primary text-white border-primary" : "bg-slate-200 text-slate-500 border-slate-200"
            }`}>
              2
            </div>
            <span className={`text-[10px] font-semibold ${step >= 2 ? "text-primary" : "text-slate-400"}`}>Details</span>
          </div>
          {/* Step 3 Indicator */}
          <div className="flex flex-col items-center gap-1 bg-slate-50 px-2 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
              step >= 3 ? "bg-primary text-white border-primary" : "bg-slate-200 text-slate-500 border-slate-200"
            }`}>
              3
            </div>
            <span className={`text-[10px] font-semibold ${step >= 3 ? "text-primary" : "text-slate-400"}`}>Attachments</span>
          </div>
          {/* Step 4 Indicator */}
          <div className="flex flex-col items-center gap-1 bg-slate-50 px-2 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
              step >= 4 ? "bg-primary text-white border-primary" : "bg-slate-200 text-slate-500 border-slate-200"
            }`}>
              4
            </div>
            <span className={`text-[10px] font-semibold ${step >= 4 ? "text-primary" : "text-slate-400"}`}>Submit</span>
          </div>
        </div>
      </div>

      {/* Steps Content inside a Card */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-primary">เลือกประเภทพัสดุ</h2>
              <p className="text-xs text-slate-500">กรุณาเลือกประเภทอุปกรณ์ช่วยชีวิตนักบินหลักที่ท่านต้องการเบิก</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category Card: Helmet */}
              <div
                onClick={() => setCategory("Helmet")}
                className={`p-5 border rounded-xl flex flex-col items-center text-center gap-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                  category === "Helmet"
                    ? "border-primary bg-sky-50/50 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-4xl text-primary">engineering</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Helmet</h4>
                  <p className="text-[10px] text-slate-400 mt-1"> Flight protection helmets and Visors </p>
                </div>
              </div>

              {/* Category Card: G-Suit */}
              <div
                onClick={() => setCategory("G-Suit")}
                className={`p-5 border rounded-xl flex flex-col items-center text-center gap-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                  category === "G-Suit"
                    ? "border-primary bg-sky-50/50 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-4xl text-primary">apparel</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">G-Suit</h4>
                  <p className="text-[10px] text-slate-400 mt-1"> Anti-G strain counter compression suits </p>
                </div>
              </div>

              {/* Category Card: Oxygen Mask */}
              <div
                onClick={() => setCategory("Oxygen Mask")}
                className={`p-5 border rounded-xl flex flex-col items-center text-center gap-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                  category === "Oxygen Mask"
                    ? "border-primary bg-sky-50/50 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-4xl text-primary">air</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Oxygen Mask</h4>
                  <p className="text-[10px] text-slate-400 mt-1"> Breathing masks and tactical comms </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-primary">รายละเอียดคำขอเบิก</h2>
              <p className="text-xs text-slate-500">โปรดระบุจำนวนและอธิบายเหตุผลความจำเป็นในการเบิกอุปกรณ์นี้</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">จำนวน (ชิ้น)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-sans"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">เหตุผลความจำเป็น</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="เช่น ตรวจพบรอยร้าวบนหมวกบินหลังเสร็จสิ้นการฝึก, อุปกรณ์เดิมหมดอายุการใช้งาน เป็นต้น..."
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-sans resize-none"
                  required
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-primary">แนบเอกสารรับรองความเสียหาย (Attachments)</h2>
              <p className="text-xs text-slate-500">หากมีความเสียหายของอุปกรณ์ สามารถแนบภาพถ่ายหรือใบรายงานเพื่อเพิ่มความรวดเร็วในการพิจารณา</p>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <span className="material-symbols-outlined text-slate-400 text-4xl group-hover:text-primary transition-colors">cloud_upload</span>
              <p className="mt-2 text-xs text-slate-600">ลากและวางเอกสารใบรับรอง หรือ <span className="text-primary underline">เลือกจากเครื่อง</span></p>
              <p className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG (สูงสุด 10MB)</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="material-symbols-outlined text-primary text-sm">description</span>
                <span>RTAF_Damage_Report_Somchai.pdf</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">1.2 MB</span>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-primary">ตรวจสอบรายละเอียด</h2>
              <p className="text-xs text-slate-500">กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนส่งขออนุมัติตามสายการบังคับบัญชา</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200/50">
                <span className="text-slate-500">ประเภทพัสดุ</span>
                <span className="font-bold text-slate-800">{category}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/50">
                <span className="text-slate-500">จำนวนที่ขอเบิก</span>
                <span className="font-bold text-slate-800">{quantity} ชิ้น</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/50">
                <span className="text-slate-500">หน่วยบินผู้ส่งคำขอ</span>
                <span className="font-bold text-slate-800">กองบิน 4 (ตาคลี)</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">เหตุผลความจำเป็น</span>
                <p className="text-slate-800 italic bg-white p-2 rounded border border-slate-100">{reason || "ไม่ได้ระบุเหตุผล (ใช้คำขอมาตรฐาน)"}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Controls */}
        <div className="flex justify-between items-center mt-8 border-t border-slate-100 pt-4">
          <button
            onClick={handleBack}
            className="border border-slate-300 text-slate-700 bg-white py-2 px-6 rounded-lg font-bold text-xs tracking-wider flex items-center gap-1 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            ย้อนกลับ
          </button>
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="bg-primary text-white py-2.5 px-6 rounded-lg font-bold text-xs tracking-wider flex items-center gap-1 hover:bg-primary-container transition-all cursor-pointer shadow-xs"
            >
              ขั้นตอนถัดไป <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 text-white py-2.5 px-6 rounded-lg font-bold text-xs tracking-wider flex items-center gap-1 hover:bg-emerald-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "กำลังส่งคำขอ..." : "ส่งคำขออนุมัติ"} <span className="material-symbols-outlined text-sm">send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
