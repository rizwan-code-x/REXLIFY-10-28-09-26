const fs = require('fs');

const replacementBlock = `                {/* ========================================================================= */}
                {/* 1. PAY ONLINE VIEW (RODP PAY WITH OFFICIAL 9593388785@upi CONFIRMATION) */}
                {/* ========================================================================= */}
                {paymentSubView === 'online' && (
                  <div className="space-y-6 animate-fade-in text-left">
                    
                    {/* PAY ONLINE DESK */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-5 text-slate-800">
                      
                      {/* Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-[9px] font-mono font-black uppercase">
                              ONLINE UPI GATEWAY
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-700 font-mono font-bold">Live Integration</span>
                          </div>
                          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 pt-1">
                            <Sparkles size={16} className="text-emerald-600" />
                            <span>অনলাইন ইউপিআই পেমেন্ট (RODP Pay Desk)</span>
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">
                            আপনার মোবাইল ডিভাইসে থাকা ইউপিআই অ্যাপ (GPay, PhonePe, Paytm, BHIM) দিয়ে সরাসরি পরিশোধ করুন।
                          </p>
                        </div>

                        {/* Official UPI Badge */}
                        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 shrink-0">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-mono uppercase text-slate-400 font-bold block">
                              OFFICIAL UPI ID
                            </span>
                            <span className="text-xs font-mono font-black text-emerald-700">
                              9593388785@upi
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyUpiText('9593388785@upi', 'UPI ID')}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                            title="কপি করুন"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Pay Form Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* 1. Branch Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-mono uppercase text-slate-600 font-black flex items-center gap-1.5">
                            <Building size={13} className="text-amber-600" />
                            <span>যে ব্রাঞ্চে পেমেন্ট করতে চান (Select Branch) *</span>
                          </label>
                          <select
                            value={paymentSelectedShopId}
                            onChange={(e) => setPaymentSelectedShopId(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
                          >
                            {shops && shops.length > 0 ? (
                              shops.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.customId || 'Branch'} - {s.address?.slice(0, 24) || 'Murshidabad'})
                                </option>
                              ))
                            ) : (
                              <option value="shop_1">RIZWAN ONLINE DREAMS (Head Office)</option>
                            )}
                          </select>
                        </div>

                        {/* 2. Amount Input */}
                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-mono uppercase text-slate-600 font-black flex items-center gap-1.5">
                            <IndianRupee size={13} className="text-emerald-600" />
                            <span>টাকার পরিমাণ (Amount in ₹) *</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                            <input
                              type="number"
                              min="1"
                              placeholder="0"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Unpaid Bills Quick Selector (if customer has pending bills from branch) */}
                      {userInvoices.filter(inv => inv.status !== 'Paid').length > 0 && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5">
                          <span className="text-[10px] font-bold text-amber-800 uppercase font-mono block">
                            💡 আপনার বকেয়া ডিজিটাল বিল পাওয়া গেছে:
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {userInvoices.filter(inv => inv.status !== 'Paid').map(inv => (
                              <button
                                key={inv.id}
                                type="button"
                                onClick={() => {
                                  setPaymentAmount(inv.totalAmount.toString());
                                  if (inv.shopId) setPaymentSelectedShopId(inv.shopId);
                                }}
                                className="px-3 py-1.5 bg-white border border-amber-300 hover:border-emerald-500 rounded-xl text-[11px] font-bold text-slate-800 flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
                              >
                                <span>{inv.serviceType || 'Service'}</span>
                                <span className="text-emerald-700 font-mono font-black">₹{inv.totalAmount}</span>
                                <span className="text-[9px] text-slate-400">({inv.id})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PRIMARY ACTION BUTTON: RODP PAY ওপেন করুন ➔ */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const amt = parseFloat(paymentAmount);
                            if (!amt || amt <= 0) {
                              alert('অনুগ্রহ করে সঠিক টাকার পরিমাণ (₹) লিখুন।');
                              return;
                            }
                            setUpiConfirmDialog(true);
                            setUpiTargetChoice('official');
                            setCustomUpiInput('');
                            setShowUpiAppsTray(false);
                          }}
                          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                        >
                          <CreditCard size={17} />
                          <span>RODP PAY ওপেন করুন ➔</span>
                        </button>
                      </div>

                    </div>

                    {/* SUCCESS CARD AFTER PAYMENT SUBMISSION */}
                    {rodpPaySuccessPayment && (
                      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-emerald-500 shadow-xl text-center space-y-4 animate-scale-up text-slate-800">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                          <CheckCircle2 size={32} className="animate-bounce" />
                        </div>
                        <div className="space-y-1">
                          <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-black uppercase">
                            ✓ PAYMENT REQUEST RECORDED
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                            🎉 পেমেন্ট রিকোয়েস্ট সফলভাবে সেন্ট হয়েছে!
                          </h3>
                          <p className="text-xs text-slate-600 max-w-md mx-auto">
                            স্ট্যাটাস: <strong className="text-amber-600 font-mono">⏳ পেন্ডিং (Pending)</strong>। আপনার নির্বাচিত ব্রাঞ্চ ({rodpPaySuccessPayment.shopName}) অথবা সিইও প্যানেল থেকে অনুমোদন করার পর এটি হিসাব খাতায় 'কনফার্মড' হবে।
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto space-y-1.5 text-xs font-mono text-left">
                          <div className="flex justify-between">
                            <span className="text-slate-400">TRACKING ID:</span>
                            <span className="text-emerald-700 font-bold">{rodpPaySuccessPayment.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">টাকার পরিমাণ:</span>
                            <span className="text-slate-900 font-bold text-sm">₹{rodpPaySuccessPayment.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">উদ্দিষ্ট ব্রাঞ্চ:</span>
                            <span className="text-amber-800 font-bold truncate">{rodpPaySuccessPayment.shopName}</span>
                          </div>
                        </div>

                        <div className="flex justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentSubView('history');
                              setLedgerTab('payments');
                            }}
                            className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                          >
                            Payment Ledger / হিসাব খাতা দেখুন ➔
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRodpPaySuccessPayment(null);
                              setPaymentAmount('');
                            }}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs uppercase cursor-pointer transition-all"
                          >
                            নতুন পেমেন্ট করুন
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* ========================================================================= */}
                {/* 2. PAYMENT LEDGER VIEW / হিসাব খাতা (REAL-TIME DASHBOARD OF ALL BILLS) */}
                {/* ========================================================================= */}
                {paymentSubView === 'history' && (
                  <div className="space-y-5 animate-fade-in text-left">
                    
                    {/* Header Strip & Sub-tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 font-mono uppercase flex items-center gap-2">
                          <FileText size={16} className="text-cyan-700" />
                          <span>হিসাব খাতা ও ডিজিটাল লেজার (Payment Ledger)</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          শাখা থেকে পাঠানো ডিজিটাল বিল এবং আপনার অনলাইন পেমেন্টের লাইভ হিসাব।
                        </p>
                      </div>

                      {/* Sub-tabs switcher */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => setLedgerTab('invoices')}
                          className={\`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer \${
                            ledgerTab === 'invoices'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }\`}
                        >
                          <Receipt size={13} />
                          <span>শাখা বিল ({userInvoices.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLedgerTab('payments')}
                          className={\`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer \${
                            ledgerTab === 'payments'
                              ? 'bg-white text-emerald-800 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }\`}
                        >
                          <CreditCard size={13} />
                          <span>অনলাইন পেমেন্ট ({userOnlinePayments.length})</span>
                        </button>
                      </div>
                    </div>

                    {/* SUB-VIEW A: BRANCH INVOICES SENT TO MOBILE (userInvoices) */}
                    {ledgerTab === 'invoices' && (
                      <div className="space-y-4">
                        {userInvoices.length === 0 ? (
                          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <Receipt size={32} className="mx-auto text-slate-400" />
                            <p className="text-xs font-bold text-slate-800">শাখা থেকে এখনো কোনো ডিজিটাল বিল আসেনি</p>
                            <p className="text-[11px] text-slate-500">
                              আপনার আবেদন ব্রাঞ্চ কনফার্ম করে "Send to Mobile" অপশনে ক্লিক করলে তাৎক্ষণিক বিল এখানে যুক্ত হবে।
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {userInvoices.map((inv) => {
                              const isPaid = inv.status === 'Paid';
                              const invShop = shops.find(s => s.id === inv.shopId);

                              return (
                                <div
                                  key={inv.id}
                                  className={\`p-4 rounded-2xl border space-y-3 transition-all \${
                                    isPaid ? 'bg-emerald-50/60 border-emerald-300/80' : 'bg-white border-slate-200 shadow-xs'
                                  }\`}
                                >
                                  {/* Invoice Header */}
                                  <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                                    <div>
                                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                                        ইনভয়েস নম্বর
                                      </span>
                                      <span className="text-xs font-mono font-black text-slate-900">
                                        {inv.id}
                                      </span>
                                    </div>
                                    <span className={\`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border \${
                                      isPaid
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : 'bg-amber-100 text-amber-800 border-amber-300'
                                    }\`}>
                                      {isPaid ? '✓ PAID / পরিশোধিত' : '⏳ UNPAID / বকেয়া'}
                                    </span>
                                  </div>

                                  {/* Invoice Details */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-[9px] text-slate-400 block font-bold">সেবা (Service)</span>
                                      <span className="font-bold text-slate-900 truncate block">{inv.serviceType || 'Digital Service'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 block font-bold">টাকার পরিমাণ</span>
                                      <span className="text-sm font-mono font-black text-emerald-700">₹{inv.totalAmount}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 block font-bold">তারিখ</span>
                                      <span className="text-slate-600 font-mono text-[11px]">{inv.date || 'Today'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 block font-bold">ইস্যুকারী ব্রাঞ্চ</span>
                                      <span className="text-amber-800 font-bold text-[11px] truncate block">
                                        {invShop?.name || 'RODP Central Branch'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.print();
                                      }}
                                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[10.5px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      <Printer size={12} />
                                      <span>রশিদ দেখুন / প্রিন্ট</span>
                                    </button>

                                    {!isPaid && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPaymentAmount(inv.totalAmount.toString());
                                          if (inv.shopId) setPaymentSelectedShopId(inv.shopId);
                                          setPaymentSubView('online');
                                        }}
                                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10.5px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                                      >
                                        <CreditCard size={12} />
                                        <span>পে করুন ➔</span>
                                      </button>
                                    )}
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-VIEW B: ONLINE UPI PAYMENTS LEDGER (userOnlinePayments) */}
                    {ledgerTab === 'payments' && (
                      <div className="space-y-4">
                        {userOnlinePayments.length === 0 ? (
                          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <CreditCard size={32} className="mx-auto text-slate-400" />
                            <p className="text-xs font-bold text-slate-800">কোনো অনলাইন পেমেন্ট রেকর্ড নেই</p>
                            <p className="text-[11px] text-slate-500">
                              অনলাইন পে অপশন থেকে ইউপিআই পেমেন্ট সম্পন্ন করলে এখানে সংরক্ষিত থাকবে।
                            </p>
                            <button
                              type="button"
                              onClick={() => setPaymentSubView('online')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
                            >
                              পেমেন্ট করুন ➔
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {userOnlinePayments.map((payment) => {
                              const isConfirmed = payment.status === 'Confirmed';
                              const isRejected = payment.status === 'Rejected';

                              return (
                                <div
                                  key={payment.id}
                                  className={\`p-4 rounded-2xl border space-y-3 transition-all \${
                                    isConfirmed
                                      ? 'bg-emerald-50/70 border-emerald-300'
                                      : isRejected
                                      ? 'bg-rose-50/70 border-rose-300'
                                      : 'bg-white border-slate-200 shadow-xs'
                                  }\`}
                                >
                                  {/* Header: Tracking ID & Status Badge */}
                                  <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                                    <div>
                                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                                        TRACKING ID
                                      </span>
                                      <span className="text-xs font-mono font-black text-slate-900">
                                        {payment.id}
                                      </span>
                                    </div>
                                    <span className={\`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border \${
                                      isConfirmed
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : isRejected
                                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                                        : 'bg-amber-100 text-amber-800 border-amber-300'
                                    }\`}>
                                      {isConfirmed ? '✓ CONFIRMED / অ্যাপ্রুভড' :
                                       isRejected ? '❌ REJECTED' :
                                       '⏳ PENDING / অপেক্ষমান'}
                                    </span>
                                  </div>

                                  {/* Details */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-[9px] text-slate-400 block font-bold">টাকার পরিমাণ</span>
                                      <span className="text-sm font-mono font-black text-slate-900">₹{payment.amount}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 block font-bold">তারিখ</span>
                                      <span className="text-slate-600 font-bold text-[11px]">
                                        {new Date(payment.submittedAt).toLocaleDateString()} {new Date(payment.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-[9px] text-slate-400 block font-bold">উদ্দিষ্ট ব্রাঞ্চ</span>
                                      <span className="text-amber-800 font-bold text-[11px] truncate block">
                                        {payment.shopName || 'Main Branch Office'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Approval info */}
                                  {isConfirmed && (
                                    <div className="p-2 bg-emerald-100/80 border border-emerald-200 rounded-xl text-[10.5px] text-emerald-900 space-y-0.5">
                                      <p className="font-bold flex items-center gap-1">
                                        <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
                                        <span>অনুমোদনকারী: {payment.confirmedBy || payment.shopName}</span>
                                      </p>
                                    </div>
                                  )}

                                  {/* Actions: Verify Status Check & Delete Option */}
                                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => setStatusCheckModalPayment(payment)}
                                      className="flex-1 py-1.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 font-bold rounded-xl text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                                    >
                                      <ShieldCheck size={12} />
                                      <span>ভেরিফাই স্ট্যাটাস চেক</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm('আপনি কি এই পেমেন্ট রেকর্ডটি মুছে ফেলতে চান?')) {
                                          if (deleteOnlinePayment) {
                                            deleteOnlinePayment(payment.id);
                                          } else {
                                            try {
                                              const stored = JSON.parse(localStorage.getItem('rodp_onlinePayments') || '[]');
                                              localStorage.setItem('rodp_onlinePayments', JSON.stringify(stored.filter((p) => p.id !== payment.id)));
                                            } catch (e) {}
                                          }
                                        }
                                      }}
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                                      title="মুছে ফেলুন"
                                    >
                                      <Trash2 size={12} />
                                      <span>ডিলিট</span>
                                    </button>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

                {/* UPI CONFIRMATION & MOBILE APPS MODAL */}
                <AnimatePresence>
                  {upiConfirmDialog && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 text-left"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-900 font-mono uppercase">
                                ইউপিআই পেমেন্ট নিশ্চিতকরণ
                              </h3>
                              <p className="text-[10px] text-slate-400 font-bold">RODP Official Gateway</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUpiConfirmDialog(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* Amount & Target Branch summary */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">নির্বাচিত ব্রাঞ্চ</span>
                            <span className="font-bold text-amber-800 text-[11px]">
                              {shops.find(s => s.id === paymentSelectedShopId)?.name || 'Central Head Office'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">মোট প্রদেয়</span>
                            <span className="text-base font-black text-emerald-700 font-mono">₹{paymentAmount}</span>
                          </div>
                        </div>

                        {/* Question: Official UPI 9593388785@upi vs Custom Number */}
                        <div className="space-y-2.5 pt-1">
                          <label className="text-xs font-black text-slate-800 block">
                            পেমেন্ট গ্রহণের ইউপিআই আইডি নির্বাচন করুন:
                          </label>

                          {/* Option 1: Official UPI ID */}
                          <div
                            onClick={() => setUpiTargetChoice('official')}
                            className={\`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 \${
                              upiTargetChoice === 'official'
                                ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }\`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-emerald-800 uppercase font-mono font-bold block">
                                অফিশিয়াল পেমেন্ট আইডি
                              </span>
                              <span className="text-xs sm:text-sm font-mono font-black text-emerald-950">
                                9593388785@upi
                              </span>
                            </div>
                            <div className={\`w-5 h-5 rounded-full border flex items-center justify-center \${
                              upiTargetChoice === 'official' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                            }\`}>
                              {upiTargetChoice === 'official' && <Check size={12} className="stroke-[3]" />}
                            </div>
                          </div>

                          {/* Option 2: Custom Number / New UPI */}
                          <div
                            onClick={() => setUpiTargetChoice('custom')}
                            className={\`p-3 rounded-2xl border cursor-pointer transition-all space-y-2 \${
                              upiTargetChoice === 'custom'
                                ? 'bg-slate-50 border-amber-500 shadow-xs ring-1 ring-amber-500'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }\`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-slate-500 uppercase font-mono font-bold block">
                                  নতুন নাম্বার বা অন্য ইউপিআই অ্যাড করুন
                                </span>
                                <span className="text-xs font-bold text-slate-700">
                                  কাস্টম ইউপিআই বা মোবাইল নম্বর দিন
                                </span>
                              </div>
                              <div className={\`w-5 h-5 rounded-full border flex items-center justify-center \${
                                upiTargetChoice === 'custom' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-300'
                              }\`}>
                                {upiTargetChoice === 'custom' && <Check size={12} className="stroke-[3]" />}
                              </div>
                            </div>

                            {upiTargetChoice === 'custom' && (
                              <input
                                type="text"
                                placeholder="e.g. 9593388785@ybl বা আপনার ইউপিআই"
                                value={customUpiInput}
                                onChange={(e) => setCustomUpiInput(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                              />
                            )}
                          </div>
                        </div>

                        {/* UPI APPS TRAY / INTENT TRIGGER */}
                        {(() => {
                          const activeUpi = (upiTargetChoice === 'custom' && customUpiInput.trim()) ? customUpiInput.trim() : '9593388785@upi';
                          const upiUrl = \`upi://pay?pa=\${activeUpi}&pn=RODP+PAY&am=\${paymentAmount}&cu=INR\`;

                          return (
                            <div className="space-y-3 pt-2">
                              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block text-center">
                                মোবাইলে থাকা অ্যাপ দিয়ে সরাসরি পে করুন:
                              </span>

                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { name: 'GPay', icon: '🟢', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                                  { name: 'PhonePe', icon: '🟣', color: 'bg-purple-50 text-purple-800 border-purple-200' },
                                  { name: 'Paytm', icon: '🔵', color: 'bg-sky-50 text-sky-800 border-sky-200' },
                                  { name: 'BHIM', icon: '🟠', color: 'bg-amber-50 text-amber-800 border-amber-200' },
                                ].map((app) => (
                                  <a
                                    key={app.name}
                                    href={upiUrl}
                                    className={\`p-2 rounded-xl border text-center text-xs font-bold transition-all active:scale-95 flex flex-col items-center justify-center gap-1 \${app.color}\`}
                                  >
                                    <span className="text-sm">{app.icon}</span>
                                    <span className="text-[10px] font-mono">{app.name}</span>
                                  </a>
                                ))}
                              </div>

                              {/* Confirm Payment Completion Button */}
                              <div className="pt-2 flex flex-col gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const amt = parseFloat(paymentAmount);
                                    const targetShop = shops.find(s => s.id === paymentSelectedShopId);
                                    const generatedId = \`ROD-PAY-\${Math.floor(100000 + Math.random() * 900000)}\`;

                                    const newRecord = {
                                      id: generatedId,
                                      customerName: currentUser?.name || 'Customer',
                                      customerMobile: currentUser?.mobile || '9593388785',
                                      customerEmail: currentUser?.email,
                                      amount: amt,
                                      screenshotUrl: '',
                                      transactionId: activeUpi,
                                      shopId: paymentSelectedShopId,
                                      shopName: targetShop?.name || 'RIZWAN ONLINE DREAMS (Head Office)',
                                      status: 'Pending',
                                      submittedAt: new Date().toISOString(),
                                      notes: \`UPI Payment to \${activeUpi}\`
                                    };

                                    if (addOnlinePayment) {
                                      addOnlinePayment(newRecord);
                                    } else {
                                      try {
                                        const stored = JSON.parse(localStorage.getItem('rodp_onlinePayments') || '[]');
                                        localStorage.setItem('rodp_onlinePayments', JSON.stringify([newRecord, ...stored]));
                                      } catch (e) {}
                                    }

                                    setUpiConfirmDialog(false);
                                    setRodpPaySuccessPayment(newRecord);
                                  }}
                                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 size={16} />
                                  <span>ইয়েস, আমি পেমেন্ট সম্পন্ন করেছি (Confirm & Save)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setUpiConfirmDialog(false)}
                                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                >
                                  বাতিল (Cancel)
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>`;

const fullContent = fs.readFileSync('src/rodp/components/CustomerPortal.tsx', 'utf8');
const lines = fullContent.split('\n');

// Replace lines 5748 through 6669 (inclusive)
const before = lines.slice(0, 5748);
const after = lines.slice(6670);

const newContent = before.join('\n') + '\n' + replacementBlock + '\n' + after.join('\n');
fs.writeFileSync('src/rodp/components/CustomerPortal.tsx', newContent, 'utf8');
console.log('CustomerPortal.tsx payment section updated successfully!');
