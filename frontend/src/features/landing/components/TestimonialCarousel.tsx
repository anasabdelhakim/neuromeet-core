"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/src/components/ui/carousel";

interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  avatar?: string;
  initials: string;
  quote: string;
}

const REVIEWS: readonly Review[] = [
  {
    id: 1,
    name: "Dr. Tarek Omar",
    role: "Professor of Computer Engineering",
    rating: 4,
    avatar: "/avatar-man.png",
    initials: "TO",
    quote:
      "The real-time ADHD engagement indicator helps me pace my lectures and know when students need a quick recap or pause.",
  },
  {
    id: 2,
    name: "Mariam Al-Sayed",
    role: "Senior Engineering Student",
    rating: 3,
    initials: "MA",
    quote:
      "As a student with ADHD, the automated neural transcriptions and highlighted action items saved my semester. I never miss critical details now.",
  },
  {
    id: 3,
    name: "Ahmed Khaled",
    role: "Graduate Researcher",
    rating: 4,
    avatar: "/avatar-man.png",
    initials: "AK",
    quote:
      "Ultra-low latency meetings combined with smart distraction filtering makes remote group projects feel as natural as sitting in the same lab.",
  },
  {
    id: 4,
    name: "Dr. Mona Adel",
    role: "Academic Department Chair",
    rating: 3,
    initials: "MA",
    quote:
      "The focus analytics gave our faculty invaluable insights into student participation without being intrusive or compromising privacy.",
  },
  {
    id: 5,
    name: "Youssef Ibrahim",
    role: "Biomedical Engineering Junior",
    rating: 4,
    avatar: "/avatar-man.png",
    initials: "YI",
    quote:
      "The live speech transcriptions and speaker tracking let me follow complex discussions effortlessly even in noisy environments.",
  },
  {
    id: 6,
    name: "Salma Nour",
    role: "Instructional Design Lead",
    rating: 4,
    initials: "SN",
    quote:
      "NeuroMeet strikes the ideal balance between low-latency conferencing and neurodivergent-friendly learning aids. A game changer.",
  },
] as const;

export const TestimonialCarousel = () => (
  <section
    aria-labelledby="reviews-heading"
    className="border-y border-white/10 bg-[#080B14] py-12 text-white md:py-16"
  >
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-16">
      <Carousel
        aria-label="User testimonials"
        opts={{ align: "start", loop: true, duration: 25 }}
        className="w-full"
      >
        <CarouselHeader />
        <CarouselTrack />
        <CarouselDots count={REVIEWS.length} />
      </Carousel>
    </div>
  </section>
);

const CarouselHeader = () => (
  <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <h2
        id="reviews-heading"
        className="text-xl font-bold tracking-tight text-white sm:text-2xl"
      >
        What our users say
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Real feedback from instructors and students using NeuroMeet.
      </p>
    </div>
    <div className="flex items-center gap-2">
      <CarouselPrevious className="static size-9 rounded-md border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 hover:text-white" />
      <CarouselNext className="static size-9 rounded-md border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 hover:text-white" />
    </div>
  </div>
);

const CarouselTrack = () => (
  <CarouselContent className="-ml-4 py-1">
    {REVIEWS.map((review) => (
      <CarouselItem
        key={review.id}
        className="basis-full pl-4 sm:basis-[300px] md:basis-[340px] lg:basis-[360px]"
      >
        <ReviewCard review={review} />
      </CarouselItem>
    ))}
  </CarouselContent>
);

const ReviewCard = ({ review }: { review: Review }) => (
  <article className="flex h-full flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-xs transition-colors hover:border-white/20">
    <div className="flex flex-col gap-3">
      <StarRating rating={review.rating} />
      <p className="text-sm leading-relaxed text-zinc-300">
        &ldquo;{review.quote}&rdquo;
      </p>
    </div>
    <ReviewAuthor review={review} />
  </article>
);

const StarRating = ({ rating }: { rating: number }) => (
  <div
    role="img"
    aria-label={`${rating} out of 5 stars`}
    className="flex items-center gap-1 text-amber-400"
  >
    {Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`size-3.5 ${index < rating ? "fill-current" : "text-white/20"}`}
        aria-hidden="true"
      />
    ))}
  </div>
);

const ReviewAuthor = ({ review }: { review: Review }) => (
  <div className="flex items-center gap-3 border-t border-white/10 pt-3">
    <ReviewAvatar review={review} />
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-sm font-medium text-white">{review.name}</span>
      <span className="truncate text-xs text-zinc-400">{review.role}</span>
    </div>
  </div>
);

const ReviewAvatar = ({ review }: { review: Review }) =>
  review.avatar ? (
    <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10">
      <Image src={review.avatar} alt="" fill sizes="32px" className="object-cover" />
    </div>
  ) : (
    <div
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary-light"
      aria-hidden="true"
    >
      {review.initials}
    </div>
  );

const CarouselDots = ({ count }: { count: number }) => {
  const { api } = useCarousel();
  const [snapCount, setSnapCount] = useState(count);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSnapCount(api.scrollSnapList().length);
      setActiveIndex(api.selectedScrollSnap());
    };
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  return <DotsNav api={api} snapCount={snapCount} activeIndex={activeIndex} />;
};

type DotsNavProps = {
  api: ReturnType<typeof useCarousel>["api"];
  snapCount: number;
  activeIndex: number;
};

const DotsNav = ({ api, snapCount, activeIndex }: DotsNavProps) => (
  <div role="group" aria-label="Review slides" className="mt-6 flex items-center justify-center gap-1.5">
    {Array.from({ length: snapCount }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => api?.scrollTo(index)}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={activeIndex === index ? "true" : undefined}
        className="flex h-4 cursor-pointer items-center justify-center p-0.5"
      >
        <span
          className={`h-1.5 rounded-full transition-all duration-200 ${
            activeIndex === index ? "w-5 bg-primary" : "w-1.5 bg-white/30 hover:bg-white/50"
          }`}
          aria-hidden="true"
        />
      </button>
    ))}
  </div>
);
