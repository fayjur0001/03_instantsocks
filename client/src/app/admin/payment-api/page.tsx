"use client";

import { useState } from "react";
import { PaymentApiProviderCard } from "@/components/admin/cards/PaymentApiProviderCard";
import { PaymentApiProvider, PaymentApiProviderConfigValues } from "@/types/admin/payment-api/payment-api-provider";

const MOCK_PROVIDERS: PaymentApiProvider[] = [
  {
    id: "nowpayments",
    name: "Now Payments",
    initialConfig: {
      callbackSecret: "rsms",
      apiKey: "G1QM69C-AGEM58K-G468J29-89V3QFB",
      callbackUrl: "https://acc.repeatsms.com/top-up/callback?method=now-payments&secret=rsms",
    },
  },
  {
    id: "yaanpay",
    name: "Yaan Pay",
    initialConfig: {
      callbackSecret: "rsms",
      apiKey: "G1QM69C-AGEM58K-G468J29-89V3QFB",
      callbackUrl: "https://acc.repeatsms.com/top-up/callback?method=yaan-pay&secret=rsms",
    },
  },
  {
    id: "blockonomics",
    name: "Blockonomics",
    initialConfig: {
      callbackSecret: "rsms",
      apiKey: "G1QM69C-AGEM58K-G468J29-89V3QFB",
      callbackUrl: "https://acc.repeatsms.com/top-up/callback?method=blockonomics&secret=rsms",
    },
  },
];

export default function PaymentProvidersPage() {
  // State to track which provider is currently active
  const [activeProviderId, setActiveProviderId] = useState<string>(MOCK_PROVIDERS[0].id);
  
  const handleSaveConfig = async (id: string, data: PaymentApiProviderConfigValues) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(`Saved config for ${id}:`, data);
        resolve();
      }, 800);
    });
  };

  const handleToggleActive = (id: string) => {
    // Treat the checkbox like a radio button by overriding the active ID
    setActiveProviderId(id);
    console.log(`Provider switched to: ${id}`);
    // You could also trigger an API call here to save the newly active provider to your database
  };

  return (
    <div className="p-3 md:p-6 space-y-6 min-h-[88vh] rounded-[12px] bg-c-bg-850 text-c-slate-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Payment API Configurations
        </h1>
        <p className="text-c-slate-400 mt-1">
          Manage your callback secrets, API keys, and set your active payment gateway.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(100%,450px),1fr))]">
        {MOCK_PROVIDERS.map((provider) => (
          <PaymentApiProviderCard 
            key={provider.id} 
            provider={provider} 
            isActive={activeProviderId === provider.id}
            onToggleActive={handleToggleActive}
            onSave={handleSaveConfig} 
          />
        ))}
      </div>
    </div>
  );
}