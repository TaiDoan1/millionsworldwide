import AdminForm from "./AdminForm"
import { getSettings } from "../actions/settings"

export default async function AdminPage() {
  const currentSettings = await getSettings()
  
  return (
    <main className="min-h-screen bg-[#F8F8F8] text-black py-32 px-8">
      <div className="max-w-xl mx-auto bg-white p-12 shadow-xl shadow-black/5">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Banner Admin</h1>
        <p className="text-sm text-gray-500 mb-10">Manage layout and colors for your homepage.</p>
        <AdminForm initialSettings={currentSettings} />
      </div>
    </main>
  )
}
