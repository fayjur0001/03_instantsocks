import { DashboardCardData } from "@/types/user/dashboard";
import { DashboardCard } from "../../cards/DashboardCard";

// --- Mock Data ---
const dashboardData: DashboardCardData[] = [
  {
    id: "balance",
    type: "metric",
    title: "Current",
    subtitle: "Balance",
    value: "$ 34.00",
    valueColorClass: "text-c-red-300", // Orange/Red custom color
  },
  {
    id: "spend",
    type: "metric",
    title: "Total",
    subtitle: "Spend",
    value: "$ 1294.00",
    valueColorClass: "text-c-red-300",
  },
  {
    id: "pending",
    type: "metric",
    title: "Pending",
    subtitle: "Top UP",
    value: "$ 105.00",
    valueColorClass: "text-c-red-300",
  },
  {
    id: "discount",
    type: "metric",
    title: "Current",
    subtitle: "Discount",
    value: "15%",
    valueColorClass: "text-c-green-400", // Emerald green
  },
  {
    id: "expiring",
    type: "list",
    title: "Service",
    subtitle: "Expiring Soon",
    items: [
      { id: "cashapp", name: "Cash App", date: "05/12/2025" },
      { id: "apple", name: "Apple", date: "01/10/2025" },
    ],
  },
];

function InfoCardsArea() {
    return (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(210px,1fr))]">
            {dashboardData.map((card) => {
                return <DashboardCard key={card.id} card={card} />;
            })}
        </div>
    )
}

export default InfoCardsArea