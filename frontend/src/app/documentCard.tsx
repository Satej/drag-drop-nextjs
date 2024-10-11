'use client';

import { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Image from 'next/image';
import { DocumentCardProps } from './documents';

export default function DocumentCard({ document, index, moveCard }: DocumentCardProps) {
  const [loader, setLoader] = useState(true);
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    hover(item: { index: number }) {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index; // update the dragged item index
      }
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white shadow-md rounded-lg p-4 cursor-pointer h-56 ${isDragging ? 'opacity-50' : ''}`}
    >
      <h3 className="text-lg font-semibold">{document.title}</h3>
      <div className="relative w-full h-0 pb-2/3">
        <Image
          src={`/images/${document.type}.png`}
          alt={document.title}
	  height={170}
	  width={170}
          objectFit="cover"
          className={`rounded-md transition-opacity duration-300 ${isDragging ? 'opacity-50' : ''}`}
          onLoad={_ => setLoader(false)}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-70 flex items-center justify-center">
          <div className={`${loader ? 'loader' : ''}`}></div>
        </div>
      </div>
    </div>
  );
}
