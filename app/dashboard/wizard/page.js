// app/dashboard/wizard/page.js
import BrandSettingsTab from "../../../components/dashboard/BrandSettingsTab";
import Navigation from "../../../components/Navigation";

export const metadata = {
  title: "Content Generation Wizard",
};

export default function WizardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="p-6">
        <BrandSettingsTab />
      </main>
    </div>
  );
}