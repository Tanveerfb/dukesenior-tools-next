interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  circle?: boolean;
}

export default function Skeleton({
  width = "100%",
  height = "1rem",
  className = "",
  circle = false,
}: SkeletonProps) {
  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: circle ? "50%" : "4px",
  };

  return <div className={`skeleton ${className}`} style={style} />;
}
