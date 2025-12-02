import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  className?: string;
}

export default function TestimonialCard({
  quote,
  author,
  role,
  avatarUrl,
  className = '',
}: TestimonialCardProps) {
  return (
    <div
      className={`p-6 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] shadow-lg shadow-black/20 ${className}`}
    >
      {/* Quotation mark */}
      <svg
        className="w-8 h-8 text-[#c0ff6b]/30 mb-4"
        fill="currentColor"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
      </svg>

      <p className="text-lg text-[#d5d5d5] mb-4 italic leading-relaxed">{quote}</p>

      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${author}'s avatar`}
            className="w-10 h-10 rounded-full object-cover border border-[#656565]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#c0ff6b] flex items-center justify-center text-black font-semibold text-sm">
            {author.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-[#d5d5d5] font-medium text-sm">{author}</p>
          {role && <p className="text-[#656565] text-xs">{role}</p>}
        </div>
      </div>
    </div>
  );
}
