"use client";
// NOTE: the homepage no longer renders this component. it remains in the
// codebase for potential future metrics but currently produces static dummy
// data and is effectively deprecated.
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FiUsers, FiAward, FiPlayCircle, FiTrendingUp } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  colorClass: string;
  bgClass: string;
  delay?: number;
}

function CountUpAnimation({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(end * easeOut);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration, isInView]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix = "",
  colorClass,
  bgClass,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        "p-6 rounded-xl border border-border dark:border-border-dark",
        "bg-card dark:bg-card-dark hover:shadow-soft-lg transition-all",
      )}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full",
            bgClass,
          )}
        >
          <span className={colorClass}>{icon}</span>
        </div>
        <div>
          <div
            className={cn(
              "text-3xl md:text-4xl font-bold leading-none",
              colorClass,
            )}
          >
            <CountUpAnimation end={value} suffix={suffix} />
          </div>
          <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted mt-1.5 font-medium">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsOverview() {
  const stats: StatCardProps[] = [
    {
      icon: <FiUsers size={28} />,
      label: "Active Players",
      value: 47,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      delay: 0,
    },
    {
      icon: <FiAward size={28} />,
      label: "Tournaments",
      value: 5,
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
      delay: 0.1,
    },
    {
      icon: <FiPlayCircle size={28} />,
      label: "Recorded Runs",
      value: 230,
      suffix: "+",
      colorClass: "text-info",
      bgClass: "bg-info/10",
      delay: 0.2,
    },
    {
      icon: <FiTrendingUp size={28} />,
      label: "Community Posts",
      value: 42,
      colorClass: "text-success",
      bgClass: "bg-success/10",
      delay: 0.3,
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-background dark:bg-background-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
