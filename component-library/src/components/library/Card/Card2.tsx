'use client';

import React from 'react';

interface Card2Props {
  quote?: string;
  highlight?: string;
  name?: string;
  title?: string;
  avatarUrl?: string;
}

const Card2: React.FC<Card2Props> = ({
  quote = "This is a great course!",
  highlight = "Every engineer who touches frontend at Delphi has to go through it",
  name = "Alex Martin",
  title = "Founder, Dolphins",
  avatarUrl = "https://randomuser.me/api/portraits/men/32.jpg"
}) => {
  return (
    <div className="inline-block">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 w-full max-w-[900px] transition-all duration-300 
                      shadow-[inset_1px_1px_1px_rgba(0,0,0,0.01)] 
                      hover:shadow-[inset_1px_1px_6px_rgba(0,0,0,0.01)] 
                      hover:bg-[#fafafa]">
        
        {/* Quote Text */}
        <p className="text-[#7a7a7a] text-2xl leading-relaxed mb-0">
          {quote}{' '}
          <span className="font-medium text-gray-700">
            {highlight}
          </span>
          , fully covered by the company.
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-4 mt-10">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
            <img 
              src={avatarUrl} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-gray-700 font-semibold text-xl">
              {name}
            </span>
            <span className="text-[#7a7a7a] text-xl">
              {title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card2;
