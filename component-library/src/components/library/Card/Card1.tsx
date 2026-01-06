'use client';

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

export default Card1;
