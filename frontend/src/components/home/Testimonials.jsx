const REVIEWS = [
  { name: 'Priya S.',  text: 'Foodigo is amazing! Food arrives hot every single time.', stars: 5 },
  { name: 'Rahul M.', text: 'Super fast delivery and a great variety of restaurants.', stars: 5 },
  { name: 'Anita K.', text: 'Love the promo codes! SAVE20 saves me every week.',       stars: 4 },
]

export default function Testimonials() {
  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
        What our customers say 💬
      </h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((r, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <p className="text-yellow-400 text-lg mb-2">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 italic">"{r.text}"</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">— {r.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
