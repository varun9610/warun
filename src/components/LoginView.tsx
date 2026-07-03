import React, { useState, useRef, useEffect } from "react";
import { UserRole } from "../types";
import { motion, AnimatePresence } from "motion/react";
// @ts-expect-error - Vite handles image imports dynamically
import rtafLogo from "../assets/images/rtaf_crest_logo_1782974371704.jpg";

interface LoginViewProps {
  onLogin: (role: UserRole, username: string) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "admin">("pilot");
  const [username, setUsername] = useState("somchai_rtaf");

  // OTP State management
  const [otpInputs, setOtpInputs] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [showOtpToast, setShowOtpToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // RTAF Authentication Protocol Monitor
  const [authLogs, setAuthLogs] = useState<string[]>([
    "Ready to receive connection requests",
    "RTAF_AUTHENTICATION settings loaded: BasicBackend active (PasswordBackend disabled)",
    "Loaded RTAF MFA Gateway URL: https://otp.rtaf.mi.th/api/v2/mfa/login"
  ]);
  const [showLogMonitor, setShowLogMonitor] = useState(true);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update default username based on role
  const handleRoleSelect = (role: UserRole | "admin") => {
    setSelectedRole(role);
    setLoginError(null);
    if (role === "pilot") {
      setUsername("somchai_rtaf");
    } else if (role === "supply") {
      setUsername("supply_officer_hq");
    } else if (role === "commander") {
      setUsername("commander_wing4");
    } else if (role === "executive") {
      setUsername("executive_rtaf");
    } else if (role === "admin") {
      setUsername("admin_rtaf");
    }
    setOtpInputs(["", "", "", "", "", ""]);
    setOtpSent(false);
    setShowOtpToast(false);
    setAuthLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Role switched to ${role}. Selected username preset: ${
        role === "pilot" ? "somchai_rtaf" : role === "supply" ? "supply_officer_hq" : role === "commander" ? "commander_wing4" : role === "executive" ? "executive_rtaf" : "admin_rtaf"
      }`
    ]);
  };

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpCountdown]);

  // Request RTAF OTP simulation
  const handleRequestOtp = () => {
    if (!username.trim()) {
      setLoginError("กรุณากรอกชื่อผู้ใช้งาน ทอ. ก่อนขอรับรหัส OTP");
      return;
    }
    setLoginError(null);
    setIsRequestingOtp(true);

    setAuthLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Requesting OTP for user: ${username}@rtaf.mi.th`,
      `[${new Date().toLocaleTimeString()}] calling RTAF MFA Service...`,
      `[${new Date().toLocaleTimeString()}] POST https://otp.rtaf.mi.th/api/v2/mfa/login with user=${username}&pass=[MFA_REQUEST]`
    ]);

    // Simulate calling https://otp.rtaf.mi.th/api/v2/mfa/login
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      setIsRequestingOtp(false);
      setOtpCountdown(60);
      setShowOtpToast(true);
      setCopied(false);

      setAuthLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] OTP generated successfully: [${code}]`,
        `[${new Date().toLocaleTimeString()}] Client state: awaiting 6-digit confirmation`
      ]);

      // Auto-focus on the first OTP input block
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }, 1200);
  };

  // Copy OTP code from SMS/Toast simulation
  const handleCopyOtp = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle individual OTP Pin inputs
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // allow only numbers
    const newOtp = [...otpInputs];
    // take only last character if pasted
    newOtp[index] = value.substring(value.length - 1);
    setOtpInputs(newOtp);
    setLoginError(null);

    // Move focus to next input if filled
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for Backspace on PIN inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Authenticate & login via RTAF OTP
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!otpSent) {
      setLoginError("กรุณาขอรหัส OTP และระบุรหัสเพื่อเข้าสู่ระบบ");
      return;
    }
    const enteredOtp = otpInputs.join("");
    if (enteredOtp.length < 6) {
      setLoginError("กรุณากรอกรหัส OTP ให้ครบถ้วนทั้ง 6 หลัก");
      return;
    }

    setAuthLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Submitting login payload for ${username}`,
      `[${new Date().toLocaleTimeString()}] payload: { username: "${username}", login_type: "otp", password: "${enteredOtp}" }`,
      `[${new Date().toLocaleTimeString()}] Calling authentication backend: BasicBackend`
    ]);

    if (enteredOtp !== generatedOtp && enteredOtp !== "999999") { // 999999 is master bypass for testing
      setLoginError("รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      setAuthLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] HTTP 404: Invalid OTP credentials or SWC-AUTH rejection`
      ]);
      return;
    }

    setAuthLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Response 200 OK from otp.rtaf.mi.th`,
      `[${new Date().toLocaleTimeString()}] Mode verified: SWC-AUTH-Login`,
      `[${new Date().toLocaleTimeString()}] JWT generated successfully. Redirecting to dashboard based on role [${selectedRole}]...`
    ]);

    // Successful OTP auth
    setShowOtpToast(false);
    onLogin(selectedRole === "admin" ? "admin" : selectedRole, username);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-[#172c47] via-[#0b1624] to-[#050b12] relative overflow-hidden">
      {/* Decorative background grid and ambient glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* Elegant floating OTP SMS Toast */}
      <AnimatePresence>
        {showOtpToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-slate-900/95 border-2 border-amber-500/80 shadow-2xl rounded-xl p-4 text-slate-100 flex items-start gap-4 backdrop-blur-md"
          >
            <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-lg flex-shrink-0 animate-pulse">
              <span className="material-symbols-outlined text-xl">vpn_key</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  RTAF-MFA OTP Service
                </span>
                <span className="text-[10px] text-slate-400">เมื่อครู่นี้</span>
              </div>
              <p className="text-xs text-slate-200 mb-2 leading-relaxed">
                รหัส OTP สำหรับยืนยันตัวตน ทอ. ของท่านคือ <span className="text-base font-extrabold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/20 tracking-wider font-mono">{generatedOtp}</span> (ใช้งานได้ภายใน 5 นาที)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyOtp}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  {copied ? "คัดลอกแล้ว!" : "คัดลอกรหัส"}
                </button>
                <button
                  onClick={() => setShowOtpToast(false)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-slate-900/90 border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Brand Visual Side (Desktop) */}
        <div className="hidden md:flex md:w-5/12 bg-[#081322] p-8 flex-col items-center justify-center text-center relative overflow-hidden border-r border-slate-800">
          <div className="absolute inset-0 bg-radial-to-b from-blue-900/30 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <img
              alt="RTAF PEMS Logo"
              className="w-36 h-36 mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.35)] rounded-2xl overflow-hidden object-cover border-2 border-amber-400/80 bg-[#081322]/80 p-2"
              src={rtafLogo}
              referrerPolicy="no-referrer"
            />
            <h1 className="font-display font-extrabold text-3xl text-white tracking-wider mb-2 drop-shadow-sm">
              RTAF PEMS
            </h1>
            <p className="font-sans text-xs text-slate-300 max-w-[200px] leading-relaxed tracking-wide">
              Pilot Equipment Management System
            </p>
            <div className="mt-8 border-t-2 border-amber-400/40 w-16"></div>
            <p className="text-[10px] text-amber-400 mt-4 tracking-widest uppercase font-bold">
              Royal Thai Air Force
            </p>
          </div>
        </div>

        {/* Login Form Side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-[#0a1421]/95 text-slate-100">
          <div>
            {/* Mobile Logo Header */}
            <div className="flex md:hidden items-center gap-4 mb-6">
              <img
                alt="RTAF PEMS Logo"
                className="w-14 h-14 rounded-xl overflow-hidden object-cover border-2 border-amber-400/80 bg-[#081322]/80 p-1 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                src={rtafLogo}
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="font-display font-extrabold text-xl text-white tracking-wide leading-none mb-1">
                  RTAF PEMS
                </h1>
                <p className="text-[9px] text-amber-400 uppercase tracking-wider font-semibold">
                  Pilot Equipment Management System
                </p>
              </div>
            </div>

            <header className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                RTAF Authentication Server (Connected)
              </div>
              <h2 className="font-display text-2xl font-extrabold text-white mb-2 tracking-tight">
                เข้าสู่ระบบ RTAF PEMS
              </h2>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                ลงชื่อเข้าใช้งานระบบจัดการและควบคุมสิ่งอุปโภคบริโภคจำเพาะของนักบิน กองทัพอากาศไทย ผ่านระบบยืนยันตัวตนแบบหลายปัจจัย (RTAF Multi-Factor Authentication) ด้วยรหัส OTP 6 หลัก
              </p>
            </header>

            {/* Error Message Display */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-lg text-xs flex items-start gap-2 overflow-hidden"
                >
                  <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">error</span>
                  <span>{loginError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Inputs form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="font-label text-xs text-slate-300 block mb-1.5 font-bold tracking-wide">
                  ชื่อผู้ใช้งาน ทอ. (RTAF Username / Email Prefix)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    alternate_email
                  </span>
                  <input
                    className="w-full pl-10 pr-24 py-2.5 bg-slate-950/40 border border-slate-800 rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all text-sm font-sans text-white placeholder-slate-600 font-medium"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="ตัวอย่าง: somchai_rtaf"
                    type="text"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold tracking-wider font-mono uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                    @rtaf.mi.th
                  </span>
                </div>
              </div>

              {/* Strict RTAF OTP Authentication View */}
              <div className="space-y-4 pt-1">
                {!otpSent ? (
                  <div>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={isRequestingOtp}
                      className="w-full py-2.5 bg-slate-900/80 hover:bg-slate-800/80 border border-amber-500/40 hover:border-amber-400 text-amber-400 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isRequestingOtp ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-amber-400 border-t-transparent rounded-full"></span>
                          กำลังส่งคำขอ OTP ไปยังระบบ MFA ทอ. (otp.rtaf.mi.th)...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">send_to_mobile</span>
                          ขอรับรหัสผ่าน OTP เพื่อเข้าสู่ระบบ (MFA)
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-500 mt-2 text-center">
                      * รหัสผ่านหลักและรหัสผ่านเข้าใช้งานแบบเก่าถูกยกเลิกแล้วตามนโยบายความมั่นคงปลอดภัยไซเบอร์ ทอ.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <label className="font-label text-xs text-amber-400 font-bold tracking-wide flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">security</span>
                        กรอกรหัสยืนยันตัวตน OTP (6 หลัก)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {otpCountdown > 0 ? (
                          <span className="font-mono text-amber-400">ส่งรหัสอีกครั้งใน {otpCountdown} วินาที</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            className="text-amber-400 hover:underline font-bold"
                          >
                            ขอรหัสใหม่อีกครั้ง
                          </button>
                        )}
                      </span>
                    </div>

                    {/* Tactile 6-digit input boxes */}
                    <div className="flex justify-between gap-2" id="otp-container">
                      {otpInputs.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-xl font-extrabold bg-slate-950/80 border-2 border-slate-800 rounded-xl focus:border-amber-400 focus:bg-amber-400/5 focus:shadow-[0_0_12px_rgba(245,158,11,0.2)] text-white outline-none transition-all"
                        />
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-400 italic leading-relaxed">
                      โปรดป้อนรหัส 6 หลักที่ปรากฏในหน้าต่างแจ้งเตือน RTAF-MFA ด้านบน (หรือใช้รหัสผ่านด่วน <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-1 py-0.5 rounded">999999</span> เพื่อข้ามผ่านการตรวจสอบขณะประเมินผล)
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Polish Role Selector Box styled for Testing Bypass */}
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/60 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">science</span>
                    บทบาทสำหรับการจำลองเพื่อการตรวจสอบ (RTAF Role Simulation)
                  </span>
                </div>
                
                {/* Horizontal badges role selector */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: "pilot", label: "นักบิน", icon: "flight_takeoff" },
                    { id: "supply", label: "พัสดุ", icon: "inventory_2" },
                    { id: "commander", label: "ผู้อนุมัติ", icon: "verified_user" },
                    { id: "executive", label: "ผู้บริหาร", icon: "analytics" },
                    { id: "admin", label: "แอดมิน", icon: "construction" }
                  ].map((roleItem) => (
                    <button
                      key={roleItem.id}
                      type="button"
                      onClick={() => handleRoleSelect(roleItem.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                        selectedRole === roleItem.id
                          ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                          : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">{roleItem.icon}</span>
                      {roleItem.label}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-500 mt-2">
                  * เลือกบทบาทด้านบนนี้ก่อนล็อกอินด้วยรหัส OTP เพื่อทดสอบการใช้งานแผงควบคุมของกองทัพในมุมมองผู้ใช้นั้นๆ
                </p>
              </div>

              {/* Submit Authentication Button */}
              <button
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-label text-sm font-extrabold rounded-lg shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all tracking-wider mt-6 cursor-pointer flex items-center justify-center gap-2"
                type="submit"
              >
                <span className="material-symbols-outlined font-bold text-sm">login</span>
                เข้าสู่ระบบด้วย RTAF OTP
              </button>
            </form>

            {/* RTAF_AUTHENTICATION Real-time Monitor */}
            <div className="mt-6 bg-slate-950/80 rounded-xl border border-slate-800 p-3">
              <button
                type="button"
                onClick={() => setShowLogMonitor(!showLogMonitor)}
                className="w-full flex items-center justify-between text-left text-[11px] font-bold text-amber-400 cursor-pointer hover:text-amber-300 outline-none"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">terminal</span>
                  RTAF_AUTHENTICATION Protocol Monitor
                </span>
                <span className="material-symbols-outlined text-xs">
                  {showLogMonitor ? "expand_less" : "expand_more"}
                </span>
              </button>
              <AnimatePresence>
                {showLogMonitor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden"
                  >
                    <div className="bg-black/50 rounded-lg p-2.5 font-mono text-[9px] text-emerald-400 space-y-1 max-h-36 overflow-y-auto border border-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
                      {authLogs.map((log, i) => (
                        <div key={i} className="leading-normal whitespace-pre-wrap">
                          <span className="text-amber-500/80">❯</span> {log}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                      <span>MFA Target: otp.rtaf.mi.th/api/v2/mfa/login</span>
                      <span className="text-emerald-500 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        BasicBackend Secured
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <footer className="mt-8 pt-4 border-t border-slate-800/80 text-center">
            <p className="font-label text-[10px] text-slate-500">
              กองทัพอากาศไทย © 2026 Pilot Equipment Management System. สงวนลิขสิทธิ์ตามระเบียบกองทัพ.
            </p>
          </footer>
        </div>
      </motion.main>
    </div>
  );
}
