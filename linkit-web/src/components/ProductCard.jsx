export default function ProductCard({ name, category, price, originalPrice, discount, image, compact = false }) {
  const imgSrc = image || `https://placehold.co/160x140/f5f5f5/aaa?text=제품사진`

  if (compact) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 w-40">
        <div className="w-full h-[120px] bg-gray-100 overflow-hidden">
          <img src={imgSrc} alt={name} className="w-full h-full object-cover"/>
        </div>
        <div className="p-2.5">
          {discount && (
            <span className="text-[11px] font-bold text-red-500">{discount}%</span>
          )}
          <p className="text-[12px] font-semibold text-gray-900 mt-0.5 leading-tight line-clamp-2">{name}</p>
          {category && <p className="text-[10px] text-gray-400 mt-0.5">{category}</p>}
          <p className="text-[13px] font-bold text-gray-900 mt-1">{price}</p>
          {originalPrice && (
            <p className="text-[10px] text-gray-400 line-through">{originalPrice}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex gap-3 p-3">
      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
        <img src={imgSrc} alt={name} className="w-full h-full object-cover"/>
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        {category && <p className="text-[11px] text-orange-500 font-medium mb-0.5">{category}</p>}
        <p className="text-[14px] font-semibold text-gray-900 leading-snug line-clamp-2">{name}</p>
        <div className="mt-2 flex items-center gap-2">
          {discount && <span className="text-[12px] font-bold text-red-500">{discount}%</span>}
          <span className="text-[15px] font-bold text-gray-900">{price}</span>
        </div>
        {originalPrice && <p className="text-[11px] text-gray-400 line-through mt-0.5">{originalPrice}</p>}
      </div>
    </div>
  )
}
