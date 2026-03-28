import { ComponentVersion } from "@/types";
import Card1 from "@/components/library/Card/Card1";
import Card2 from "@/components/library/Card/Card2";

export const cardVersions: ComponentVersion[] = [
  {
    id: "card-v1",
    name: "Version 1",
    component: Card1,
    code: {
      tsx: `'use client';

import React, { useState } from 'react';

interface Card1Props {
  title?: string;
  content?: string;
  footer?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const Card1: React.FC<Card1Props> = ({
  title = 'Hello',
  content = 'Trying my hand at neubrutalism. Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima officiis officia, nulla commodi repellat modi ab et ea! Excepturi molestiae voluptatibus voluptatum, quaerat ducimus temporibus alias ut accusamus sed esse!',
  footer = 'Not sure how I feel about it :)',
  onSave,
  onCancel,
}) => {
  return (
    <div className="inline-block">
      <div className="bg-white border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 w-full sm:w-[700px]">
        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-medium text-gray-900 mb-6 sm:mb-8">
          {title}
        </h1>

        {/* Content */}
        <p className="text-gray-600 text-base sm:text-2xl leading-relaxed mb-4 sm:mb-6">
          {content}
        </p>

        {/* Footer */}
        <p className="text-gray-600 text-base sm:text-2xl mb-6 sm:mb-8">
          {footer}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 sm:px-6 sm:py-3 text-lg sm:text-2xl font-medium text-gray-700 bg-white border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 sm:px-6 sm:py-3 text-lg sm:text-2xl font-medium text-white bg-green-600 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card1;`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    }
  },
  {
    id: "card-v2",
    name: "Version 2",
    component: Card2,
    code: {
      tsx: `'use client';

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

export default Card2;`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    }
  }
];
