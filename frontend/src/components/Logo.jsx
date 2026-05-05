export default function Logo({
  size = "md",
  showText = true,
  className = "",
  textColor = "dark",
}) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-3xl",
    xl: "text-5xl",
  };

  const textColorClass = textColor === "light" ? "text-white" : "text-gray-900";

  const subtextColorClass =
    textColor === "light" ? "text-blue-200" : "text-blue-600";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div
        className={`${sizes[size]} bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Arrows pointing up */}
          <path d="M30 70 L30 30 L20 40" />
          <path d="M70 70 L70 30 L80 40" />
          {/* Connection line */}
          <path d="M30 50 L70 50" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold ${textColorClass}`}>
            GeniDoc
          </h1>
          <p className={`text-xs font-semibold ${subtextColorClass}`}>Hayat</p>
        </div>
      )}
    </div>
  );
}
