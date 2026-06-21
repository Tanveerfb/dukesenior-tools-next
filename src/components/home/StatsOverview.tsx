"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

function CountUpAnimation({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let id: number;
    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(end * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) id = requestAnimationFrame(animate);
      else setCount(end);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 47, label: "Active Players" },
  { value: 5, label: "Tournaments" },
  { value: 230, suffix: "+", label: "Recorded Runs" },
  { value: 42, label: "Community Posts" },
];

export default function StatsOverview() {
  return (
    <section className="py-10 md:py-14 bg-background dark:bg-background-dark border-b border-dashed border-border dark:border-border-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center divide-x divide-border dark:divide-border-dark">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex flex-col items-center text-center px-8 py-4 flex-1 min-w-[120px]"
            >
              <span
                className="text-4xl md:text-5xl leading-none mb-1"
                style={{
                  fontFamily: "var(--font-permanent-marker, 'Permanent Marker', cursive)",
                  fontWeight: 400,
                  color: "var(--color-primary)",
                }}
              >
                <CountUpAnimation end={stat.value} suffix={stat.suffix ?? ""} />
              </span>
              <span className="text-sm text-foreground-muted dark:text-foreground-dark-muted font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
