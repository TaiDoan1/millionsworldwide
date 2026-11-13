"use client";

import { useMemo, useState } from "react";
import { sizeOptionsFor, type Product } from "../../data/products";
import { placePosOrder, type PlacePosOrderInput } from "../../actions/orders";
import { formatPrice } from "../../lib/format";
import { btnPrimary, inputClass } from "../ui";

const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

type TicketLine = {
  id: string;
  name: string;
  price: number;
  size?: string;
  qty: number;
};

const PHONE_RE = /^[0-9+\s.()\-]{9,15}$/;

/**
 * POS screen: pick products (size first when the product has sizes),
 * build a ticket, then check out as an in-store sale (cash/transfer,
 * handed over on the spot) or a quick online order (COD/transfer, ships
 * like a web order). Prices are recomputed on the server at submit.
 */
export default function PosScreen({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [staging, setStaging] = useState<{
    product: Product;
    size?: string;
    qty: number;
  } | null>(null);
  const [ticket, setTicket] = useState<TicketLine[]>([]);
  const [channel, setChannel] = useState<"in-store" | "online">("in-store");
  const [payment, setPayment] = useState<"cash" | "transfer" | "cod">("cash");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<{
    code: string;
    total: number;
    change?: number;
  } | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) {
      if (!seen.has(p.category)) seen.set(p.category, p.category);
    }
    return [...seen.keys()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });
  }, [products, query, category]);

  const total = ticket.reduce((s, l) => s + l.price * l.qty, 0);
  const received = Math.floor(Number(cashReceived) || 0);
  const change = payment === "cash" ? received - total : null;

  function switchChannel(next: "in-store" | "online") {
    setChannel(next);
    setPayment(next === "in-store" ? "cash" : "cod");
    setMessage(null);
  }

  function addLine(product: Product, size: string | undefined, qty: number) {
    setTicket((prev) => {
      const found = prev.find((l) => l.id === product.id && l.size === size);
      if (found) {
        return prev.map((l) =>
          l.id === product.id && l.size === size
            ? { ...l, qty: Math.min(10, l.qty + qty) }
            : l
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, size, qty },
      ];
    });
  }

  function handleTile(product: Product) {
    if (product.soldOut) return;
    const sizes = sizeOptionsFor(product);
    if (sizes.length === 0) {
      addLine(product, undefined, 1);
      return;
    }
    setStaging({ product, size: undefined, qty: 1 });
  }

  function setLineQty(id: string, size: string | undefined, qty: number) {
    setTicket((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.id === id && l.size === size))
        : prev.map((l) =>
            l.id === id && l.size === size
              ? { ...l, qty: Math.min(10, qty) }
              : l
          )
    );
  }

  async function handleSubmit() {
    if (ticket.length === 0) {
      setMessage("Phiếu bán đang trống — chọn sản phẩm trước nhé.");
      return;
    }
    if (channel === "online") {
      if (!name.trim() || !phone.trim() || !address.trim()) {
        setMessage("Đơn online cần họ tên, số điện thoại và địa chỉ.");
        return;
      }
      if (!PHONE_RE.test(phone.trim())) {
        setMessage("Số điện thoại chưa đúng định dạng.");
        return;
      }
    }
    if (payment === "cash" && received < total) {
      setMessage("Khách đưa chưa đủ tiền — kiểm tra lại số tiền nhé.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const input: PlacePosOrderInput = {
      channel,
      items: ticket.map((l) => ({ id: l.id, qty: l.qty, size: l.size })),
      customer: {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        note: note.trim() || undefined,
      },
      payment,
    };
    const res = await placePosOrder(input);
    setBusy(false);
    if (!res.success) {
      setMessage(res.error ?? "Không lưu được đơn, thử lại nhé.");
      return;
    }
    setSuccess({
      code: res.code ?? "",
      total,
      change: payment === "cash" ? received - total : undefined,
    });
    setTicket([]);
    setStaging(null);
    setName("");
    setPhone("");
    setAddress("");
    setNote("");
    setCashReceived("");
  }

  function sellAgain() {
    setSuccess(null);
    setMessage(null);
  }

  return (
    <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Product picker */}
      <div className="bg-white p-6 shadow-xl shadow-black/5 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên sản phẩm…"
            className={`${inputClass} flex-1 min-w-[200px]`}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${EASE} ${
              category === "all"
                ? "border-black bg-black text-white"
                : "border-neutral-300 bg-white text-black hover:border-black"
            }`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${EASE} ${
                category === c
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white text-black hover:border-black"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {staging && (
          <div className="mt-6 rounded-[12px] bg-[#f5f5f5] p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold uppercase">{staging.product.name}</p>
              <button
                type="button"
                onClick={() => setStaging(null)}
                aria-label="Đóng chọn size"
                className="text-lg leading-none text-neutral-400 hover:text-black"
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-sm font-bold">{formatPrice(staging.product.price)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizeOptionsFor(staging.product).map((s) => {
                const disabled = !!s.soldOut;
                const active = staging.size === s.label;
                return (
                  <button
                    key={s.label}
                    type="button"
                    disabled={disabled}
                    onClick={() => setStaging({ ...staging, size: s.label })}
                    aria-pressed={active}
                    className={`h-11 min-w-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-700 ${EASE} ${
                      disabled
                        ? "cursor-not-allowed border-neutral-200 bg-white text-neutral-400 line-through"
                        : active
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 bg-white text-black hover:border-black"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-neutral-300 bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setStaging({ ...staging, qty: Math.max(1, staging.qty - 1) })
                  }
                  className="h-10 w-10 text-black"
                  aria-label="Giảm số lượng"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {staging.qty}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setStaging({ ...staging, qty: Math.min(10, staging.qty + 1) })
                  }
                  className="h-10 w-10 text-black"
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                disabled={!staging.size}
                onClick={() => {
                  addLine(staging.product, staging.size, staging.qty);
                  setStaging(null);
                }}
                className={btnPrimary}
              >
                Thêm vào phiếu
              </button>
              {!staging.size && (
                <span className="text-xs text-[#67645e]">Chọn size trước nhé.</span>
              )}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="mt-8 text-sm text-gray-400">Không có sản phẩm nào khớp.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={p.soldOut}
                onClick={() => handleTile(p)}
                className="overflow-hidden rounded-[12px] bg-[#f5f5f5] text-left transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {p.images[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[2/3] w-full object-cover"
                  />
                )}
                <span className="block p-3">
                  <span className="block text-xs font-bold uppercase leading-snug">
                    {p.name}
                  </span>
                  <span className="mt-1 block text-xs font-bold">
                    {formatPrice(p.price)}
                  </span>
                  {p.soldOut && (
                    <span className="mt-1 inline-block bg-[#666] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      Hết hàng
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ticket + checkout */}
      <div className="bg-white p-6 shadow-xl shadow-black/5 sm:p-8 lg:sticky lg:top-8 lg:self-start">
        {success ? (
          <div>
            <h2 className="text-xl font-bold uppercase">Bán xong ✓</h2>
            <p className="mt-2 text-sm">
              Mã đơn: <span className="font-black tracking-wider">{success.code}</span>
            </p>
            <p className="mt-1 text-sm">
              Tổng: <span className="font-bold">{formatPrice(success.total)}</span>
            </p>
            {success.change !== undefined && (
              <p className="mt-1 text-sm">
                Tiền thừa: <span className="font-bold">{formatPrice(success.change)}</span>
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Đơn đã lưu vào danh sách đơn hàng
              {channel === "in-store" ? " (đã giao)." : " (mới đặt)."}
            </p>
            <button type="button" onClick={sellAgain} className={`${btnPrimary} mt-6 w-full`}>
              Bán tiếp
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold uppercase">Phiếu bán</h2>

            {/* Channel */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(
                [
                  { key: "in-store", label: "Tại quầy" },
                  { key: "online", label: "Online" },
                ] as const
              ).map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => switchChannel(c.key)}
                  aria-pressed={channel === c.key}
                  className={`h-11 rounded-full border text-sm font-bold uppercase tracking-wider transition-colors ${EASE} ${
                    channel === c.key
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 bg-white text-black hover:border-black"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {channel === "in-store"
                ? "Khách nhận hàng tại quầy, thu tiền ngay."
                : "Lên đơn khi khách nhắn tin — giao hàng như đơn web, miễn phí vận chuyển."}
            </p>

            {/* Lines */}
            {ticket.length === 0 ? (
              <p className="mt-6 text-sm text-gray-400">
                Chưa có món nào — bấm vào sản phẩm bên trái để thêm.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-neutral-100">
                {ticket.map((l) => (
                  <li
                    key={`${l.id}::${l.size ?? ""}`}
                    className="flex items-center justify-between gap-2 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase leading-snug">{l.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(l.price)}
                        {l.size ? ` · Size ${l.size}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex items-center rounded-full border border-neutral-300">
                        <button
                          type="button"
                          onClick={() => setLineQty(l.id, l.size, l.qty - 1)}
                          className="h-8 w-8 text-black"
                          aria-label="Giảm số lượng"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLineQty(l.id, l.size, l.qty + 1)}
                          className="h-8 w-8 text-black"
                          aria-label="Tăng số lượng"
                        >
                          +
                        </button>
                      </div>
                      <span className="w-20 text-right text-sm font-bold">
                        {formatPrice(l.price * l.qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setTicket((prev) =>
                            prev.filter(
                              (x) => !(x.id === l.id && x.size === l.size)
                            )
                          )
                        }
                        aria-label={`Xoá ${l.name}`}
                        className="text-lg leading-none text-neutral-400 hover:text-black"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold">
              <span>Tổng</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Payment */}
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider">
              Thanh toán
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                (
                  channel === "in-store"
                    ? [
                        { key: "cash", label: "Tiền mặt" },
                        { key: "transfer", label: "Chuyển khoản" },
                      ]
                    : [
                        { key: "cod", label: "COD" },
                        { key: "transfer", label: "Chuyển khoản" },
                      ]
                ) as { key: "cash" | "transfer" | "cod"; label: string }[]
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPayment(p.key)}
                  aria-pressed={payment === p.key}
                  className={`h-10 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition-colors ${EASE} ${
                    payment === p.key
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 bg-white text-black hover:border-black"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {payment === "cash" && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Khách đưa (nghìn đồng)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="VD: 500 = 500.000₫"
                  className={inputClass}
                />
                {cashReceived !== "" && change !== null && (
                  <p className="mt-1 text-sm">
                    Tiền thừa:{" "}
                    <span className={change < 0 ? "font-bold text-red-600" : "font-bold"}>
                      {change < 0
                        ? `thiếu ${formatPrice(-change)}`
                        : formatPrice(change)}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Customer */}
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider">
              Khách hàng{channel === "online" ? " *" : ""}
            </p>
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  channel === "in-store" ? "Tên khách (không bắt buộc)" : "Họ tên *"
                }
                className={inputClass}
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={
                  channel === "in-store"
                    ? "Số điện thoại (không bắt buộc)"
                    : "Số điện thoại *"
                }
                className={inputClass}
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={
                  channel === "in-store" ? "Địa chỉ (không bắt buộc)" : "Địa chỉ giao hàng *"
                }
                className={inputClass}
              />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú (không bắt buộc)"
                className={inputClass}
              />
            </div>

            {message && (
              <p className="mt-4 text-sm font-semibold text-red-600">{message}</p>
            )}
            <button
              type="button"
              disabled={busy || ticket.length === 0}
              onClick={handleSubmit}
              className={`${btnPrimary} mt-6 h-[50px] w-full`}
            >
              {busy ? "Đang lưu…" : "Hoàn tất bán hàng"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
