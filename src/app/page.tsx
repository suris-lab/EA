import Calendar from "@/components/Calendar";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
          My Calendar
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Your upcoming school events at a glance.
        </p>
      </div>

      <Calendar />
    </div>
  );
}
