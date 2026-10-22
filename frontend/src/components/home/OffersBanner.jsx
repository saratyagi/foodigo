export default function OffersBanner() {
  return (
    <section className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white">
      <h2 className="text-lg font-bold mb-3">🎉 Exclusive Offers</h2>
      <div className="flex flex-wrap gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
          <p className="font-mono font-bold text-xl tracking-widest">WELCOME50</p>
          <p className="text-sm text-white/90 mt-0.5">₹50 off on your first order</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
          <p className="font-mono font-bold text-xl tracking-widest">SAVE20</p>
          <p className="text-sm text-white/90 mt-0.5">20% off on all orders</p>
        </div>
      </div>
    </section>
  )
}
