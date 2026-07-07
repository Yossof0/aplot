import { PricingConfigForm } from "@/components/admin/PricingConfigForm";
import { BundlePlanManager } from "@/components/admin/BundlePlanManager";

export default function AdminPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Admin</h1>
        <p className="text-sm text-muted">Pricing and bundle plan configuration.</p>
      </div>

      <PricingConfigForm />
      <BundlePlanManager />
    </div>
  );
}
