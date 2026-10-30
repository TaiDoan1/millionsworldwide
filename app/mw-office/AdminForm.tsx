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
    alert(result.success ? "Đã lưu cài đặt." : (result.error ?? "Không lưu được cài đặt."))
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

      {/* PROMO STRIP */}
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold tracking-tight uppercase">Banner khuyến mãi</h3>
            <p className="text-xs text-gray-500 mt-1">
              Dải chữ trên đầu trang. Tắt thì không hiện.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.promoEnabled ?? false}
              onChange={(e) => setSettings({ ...settings, promoEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>

        {settings.promoEnabled && (
          <div className="mt-6 pt-6 border-t border-neutral-200 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
                Nội dung banner
              </label>
              <input
                type="text"
                value={settings.promoText || ""}
                onChange={(e) => setSettings({ ...settings, promoText: e.target.value })}
                placeholder="VD: MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN TỪ 1.000.000Đ"
                maxLength={200}
                className="w-full border border-gray-300 p-3 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
                Link khi bấm vào (không bắt buộc)
              </label>
              <input
                type="text"
                value={settings.promoLink || ""}
                onChange={(e) => setSettings({ ...settings, promoLink: e.target.value })}
                placeholder="/trangchu"
                className="w-full border border-gray-300 p-3 text-sm rounded-sm focus:outline-none focus:border-black"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Chỉ nhận đường dẫn trong web, bắt đầu bằng / — để trống thì banner không bấm được.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* HOMEPAGE COPY */}
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-sm">
        <h3 className="text-base font-bold tracking-tight uppercase mb-1">Nội dung trang chủ</h3>
        <p className="text-xs text-gray-500 mb-6">
          Để trống một mục thì web dùng nội dung mặc định có sẵn.
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
              Chữ chạy dưới video (mỗi dòng 1 cụm)
            </label>
            <textarea
              value={settings.marqueeText || ""}
              onChange={(e) => setSettings({ ...settings, marqueeText: e.target.value })}
              placeholder={"Millions Worldwide™\nForm over noise\nMiễn phí vận chuyển toàn quốc"}
              maxLength={2000}
              rows={6}
              className="w-full border border-gray-300 p-3 text-sm rounded-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
              Tiêu đề editorial (mỗi dòng 1 hàng chữ lớn)
            </label>
            <textarea
              value={settings.editorialHeading || ""}
              onChange={(e) => setSettings({ ...settings, editorialHeading: e.target.value })}
              placeholder={"FASHION\nWITHOUT\nTHE SHOUT"}
              maxLength={200}
              rows={3}
              className="w-full border border-gray-300 p-3 text-sm rounded-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
              Đoạn editorial dưới tiêu đề
            </label>
            <textarea
              value={settings.editorialText || ""}
              onChange={(e) => setSettings({ ...settings, editorialText: e.target.value })}
              maxLength={1000}
              rows={4}
              className="w-full border border-gray-300 p-3 text-sm rounded-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSaving}
        className="bg-black text-white px-8 py-4 text-sm font-bold tracking-widest uppercase w-fit hover:opacity-80 transition-opacity disabled:opacity-50 mt-4"
      >
        {isSaving ? "Đang lưu…" : "Lưu cài đặt"}
      </button>
    </form>
  )
}
