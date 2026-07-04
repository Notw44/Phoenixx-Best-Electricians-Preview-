"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Card = {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-6 sm:gap-8 relative">
      {cards.map((card, i) => (
        <div key={i} className={cn(card.className, "min-h-[260px] sm:min-h-[340px] relative")}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              card.className,
              "relative overflow-hidden cursor-pointer",
              selected?.id === card.id
                ? "rounded-3xl absolute inset-0 h-[65%] w-full md:w-[70%] lg:w-[60%] m-auto z-50 flex justify-center items-center flex-wrap flex-col bg-[#111111] border-2 border-[#FDE047]/45 shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
                : lastSelected?.id === card.id
                ? "z-40 bg-neutral-900 border border-white/10 hover:border-[#FDE047]/30 transition-colors rounded-2xl h-full w-full"
                : "bg-neutral-900 border border-white/10 hover:border-[#FDE047]/20 hover:border-double transition-all duration-300 rounded-2xl h-full w-full"
            )}
            layoutId={`card-${card.id}`}
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            <ImageComponent card={card} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-black/60 backdrop-blur-md z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

const ImageComponent = ({ card }: { card: Card }) => {
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      src={card.thumbnail}
      className={cn(
        "object-cover object-center absolute inset-0 h-full w-full transition duration-300 brightness-90 hover:scale-105"
      )}
      alt="thumbnail"
      referrerPolicy="no-referrer"
    />
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-3xl shadow-2xl relative z-[60] p-6 sm:p-10 text-left">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.85,
        }}
        className="absolute inset-0 h-full w-full bg-gradient-to-t from-[#0C0C0C] via-black/40 to-transparent z-10"
      />
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 40,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative z-20"
      >
        {selected?.content}
      </motion.div>
    </div>
  );
};
