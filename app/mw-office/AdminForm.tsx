"use client"

import { useState } from "react"
import { updateSettings, type Settings } from "../actions/settings"

export default function AdminForm({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const result = await updateSettings(settings)
    setIsSaving(false)
    alert(result.success ? "Settings saved successfully!" : (result.error ?? "Không lưu được cài đặt."))
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-10">
      {/* COMING SOON CONTROLS */}
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold tracking-tight uppercase">Coming Soon Mode</h3>
            <p className="text-xs text-gray-500 mt-1">
              Enable full-screen video background with countdown timer for visitors.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.comingSoonEnabled}
              onChange={(e) => setSettings({ ...settings, comingSoonEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>

        {settings.comingSoonEnabled && (
          <div className="mt-6 pt-6 border-t border-neutral-200 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
                Launch Date & Time (Thời gian mở web)
              </label>
              <input
                type="datetime-local"
                value={settings.launchDate ? settings.launchDate.slice(0, 16) : ""}
                onChange={(e) => setSettings({ ...settings, launchDate: e.target.value })}
                className="w-full border border-gray-300 p-3 text-sm rounded-sm focus:outline-none focus:border-black"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Đồng hồ đếm ngược sẽ tự động tính từ bây giờ đến mốc thời gian này.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
                Tiêu đề (Title)
              </label>
              <input
                type="text"
                value={settings.comingSoonTitle || ""}
                onChange={(e) => setSettings({ ...settings, comingSoonTitle: e.target.value })}
                placeholder="THE OFFICIAL LAUNCH"
                className="w-full border border-gray-300 p-3 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
                Phụ đề (Subtitle / Tagline)
              </label>
              <input
                type="text"
                value={settings.comingSoonSubtitle || ""}
                onChange={(e) => setSettings({ ...settings, comingSoonSubtitle: e.target.value })}
                placeholder="MILLIONS IS BUILT FOR THOSE WHO CHOOSE FORM OVER NOISE"
                className="w-full border border-gray-300 p-3 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div className="p-3 bg-white border border-dashed border-gray-300 text-xs text-gray-500 rounded">
              💡 <strong>Videos đang sử dụng:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Desktop (màn hình ngang): <code className="text-black font-semibold">/videos/desktop.mp4</code></li>
                <li>Mobile (màn hình dọc): <code className="text-black font-semibold">/videos/mobile.mp4</code></li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold tracking-widest uppercase mb-4 text-gray-400">Banner Size</label>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 hover:border-black transition-colors rounded-sm">
            <input 
              type="radio" 
              name="bannerSize" 
              value="full" 
              className="w-4 h-4 accent-black"
              checked={settings.bannerSize === "full"}
              onChange={(e) => setSettings({...settings, bannerSize: "full"})}
            /> 
            <span className="font-medium text-sm">Full Screen (100%)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 hover:border-black transition-colors rounded-sm">
            <input 
              type="radio" 
              name="bannerSize" 
              value="large"
              className="w-4 h-4 accent-black" 
              checked={settings.bannerSize === "large"}
              onChange={(e) => setSettings({...settings, bannerSize: "large"})}
            /> 
            <span className="font-medium text-sm">Large (85%)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 hover:border-black transition-colors rounded-sm">
            <input 
              type="radio" 
              name="bannerSize" 
              value="medium" 
              className="w-4 h-4 accent-black"
              checked={settings.bannerSize === "medium"}
              onChange={(e) => setSettings({...settings, bannerSize: "medium"})}
            /> 
            <span className="font-medium text-sm">Medium (75%)</span>
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold tracking-widest uppercase mb-4 text-gray-400">Text Color</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              name="textColor" 
              value="white" 
              className="w-4 h-4 accent-black"
              checked={settings.textColor === "white"}
              onChange={(e) => setSettings({...settings, textColor: "white"})}
            /> 
            <span className="font-medium text-sm">White (Light Text)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              name="textColor" 
              value="black" 
              className="w-4 h-4 accent-black"
              checked={settings.textColor === "black"}
              onChange={(e) => setSettings({...settings, textColor: "black"})}
            /> 
            <span className="font-medium text-sm">Black (Dark Text)</span>
          </label>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSaving}
        className="bg-black text-white px-8 py-4 text-sm font-bold tracking-widest uppercase w-fit hover:opacity-80 transition-opacity disabled:opacity-50 mt-4"
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  )
}
