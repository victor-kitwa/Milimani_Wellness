"use client";

import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

/*
 * Sample testimonials for the Milimani storefront. These are placeholder
 * copy, not real customer quotes, for the client to review and eventually
 * swap for genuine reviews once they start coming in.
 */
type Testimonial = {
  quote: string;
  name: string;
  location: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The chamomile tea has become part of my evening routine. Delivery to Thika took less than two days and everything was well packaged.",
    name: "Njeri Mwangi",
    location: "Thika",
  },
  {
    quote:
      "I was skeptical about buying supplements online, but the Vitamin C arrived genuine and sealed, and paying with M-Pesa took seconds.",
    name: "Wanjiru Kamau",
    location: "Nairobi",
  },
  {
    quote:
      "Ordered the lavender oil for my diffuser and it's stronger and purer than what I used to get at the chemist. Reordering the eucalyptus next.",
    name: "Amina Hassan",
    location: "Mombasa",
  },
  {
    quote:
      "My omega 3 order just works, same product every month, fair prices, and their WhatsApp support actually replies fast.",
    name: "Brian Kiptoo",
    location: "Eldoret",
  },
  {
    quote:
      "The yoga mat has real grip, unlike the cheap ones I tried before. Paired it with the meditation cushion and my home practice has never been better.",
    name: "Grace Chebet",
    location: "Nakuru",
  },
  {
    quote:
      "Their shea body butter is the real deal, thick and unscented the way it should be. My skin has never felt this good in Nairobi's dry season.",
    name: "Faith Wambui",
    location: "Nairobi",
  },
  {
    quote:
      "I run a small spa in Kisumu and now source our aloe vera gel and oils from Milimani. Consistent quality, and they deliver countrywide without fuss.",
    name: "Otieno Odhiambo",
    location: "Kisumu",
  },
  {
    quote:
      "Bought the salt lamp as a gift and ended up ordering one for myself too. Nicely packaged, arrived with zero damage despite the distance to Nyeri.",
    name: "Njoroge Kariuki",
    location: "Nyeri",
  },
  {
    quote:
      "Genuine products, honest prices, and my insulated bottle still keeps water cold after a full day at work. Exactly what they promise.",
    name: "Kevin Omondi",
    location: "Nairobi",
  },
];

const ROW_ONE = TESTIMONIALS.slice(0, 5);
const ROW_TWO = TESTIMONIALS.slice(5);

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TestimonialCard({ quote, name, location }: Testimonial) {
  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Quote className="h-5 w-5 text-brand/40" aria-hidden="true" />
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
          ))}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{quote}&rdquo;</p>
      <div className="mt-auto flex items-center gap-3 pt-2">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{initialsOf(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">{location}</span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="border-t border-border bg-surface py-14 sm:py-20">
      <div className="container-page mb-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Loved by wellness shoppers across Kenya
          </h2>
          <p className="mt-2 text-muted-foreground">
            Sample feedback from customers building their wellness routines with
            us, from Nairobi to the coast.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <InfiniteSlider
          gap={16}
          speed={48}
          speedOnHover={96}
          className="[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        >
          {ROW_ONE.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </InfiniteSlider>
        <InfiniteSlider
          gap={16}
          speed={40}
          speedOnHover={80}
          reverse
          className="[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        >
          {ROW_TWO.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </InfiniteSlider>
      </div>
    </section>
  );
}
