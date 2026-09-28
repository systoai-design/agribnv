import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Home, 
  CreditCard, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import haptics from '@/utils/haptics';

export default function FarmerFinish() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [payoutSetup, setPayoutSetup] = useState(false);

  const handlePayout = () => {
    haptics.selection();
    setPayoutSetup(true);
    toast({
      title: "Payout Account Connected",
      description: "GCash/Bank disbursement linked for automatic 24-hr post check-in payout."
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-foreground flex flex-col justify-between p-4 max-w-md mx-auto select-none safe-area-pt safe-area-pb">
      {/* Top Header with Close 'X' */}
      <div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Step 4 of 4 • Launch Pad
          </span>
          <button
            onClick={() => {
              haptics.selection();
              navigate('/host');
            }}
            className="w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
            aria-label="Close to Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Farmland Staging Card */}
        <div className="mt-3 relative rounded-2xl overflow-hidden border border-border/70 shadow-sm bg-card">
          <div className="relative h-36 w-full bg-muted overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
              alt="Farm Land Celebratory"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/90 text-white mb-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-[#E09F5A]" /> Profile Ready
              </span>
              <h2 className="font-serif text-lg font-bold leading-tight">
                Amadeo Heritage Coffee Estate
              </h2>
            </div>
          </div>

          <div className="p-3.5 bg-card">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your digital farm home is staged! To start accepting bookings and direct harvest orders, complete these 3 launch checklist milestones:
            </p>
          </div>
        </div>

        {/* 3 Launch Checklist Dark Pills / Cards */}
        <div className="mt-4 space-y-2.5">
          {/* Item 1: Add First Listing */}
          <button
            onClick={() => {
              haptics.impact();
              navigate('/host/properties/new');
            }}
            className="w-full p-3 rounded-2xl bg-[#1C2C20] text-white hover:bg-[#253A2B] transition-all flex items-center justify-between text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E09F5A]">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-[#E09F5A] transition-colors">
                  Add First Listing (Stay or Tour)
                </h4>
                <p className="text-[11px] text-white/70">
                  Kubo, treehouse, campsite, or guided cupping tour
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Item 2: Set Payout Account */}
          <button
            onClick={handlePayout}
            className="w-full p-3 rounded-2xl bg-[#1C2C20] text-white hover:bg-[#253A2B] transition-all flex items-center justify-between text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Set Payout Account (GCash/Bank)
                  </h4>
                  {payoutSetup && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-white/70">
                  {payoutSetup ? "Connected: GCash 0917••••123" : "Required for automatic guest payout release"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Item 3: Preview Public Farm Profile */}
          <button
            onClick={() => {
              haptics.impact();
              navigate('/farm-profile-preview');
            }}
            className="w-full p-3 rounded-2xl bg-[#1C2C20] text-white hover:bg-[#253A2B] transition-all flex items-center justify-between text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Preview Public Farm Profile
                </h4>
                <p className="text-[11px] text-white/70">
                  See how travelers will view your stories, offers & stays
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Guidance & Legal / Safety Protection Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#F6F1E8]/80 border border-[#E5DECF] text-xs text-foreground/80 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Farm Host Protection & Safety</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All guest reservations automatically mandate acknowledgement of inherent agritourism terrain hazards. Payouts are protected with automated escrow released 24 hours after traveler check-in.
          </p>
        </div>
      </div>

      {/* Bottom Primary Action Buttons */}
      <div className="pt-6 pb-2 space-y-2">
        <button
          onClick={() => {
            haptics.impact();
            navigate('/host');
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span>Go to Host Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            haptics.selection();
            navigate('/farm-profile-preview');
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-border bg-card text-foreground text-xs font-medium hover:bg-secondary transition-colors text-center"
        >
          View Public Profile as Traveler
        </button>
      </div>
    </div>
  );
}
