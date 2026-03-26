"use client"

export function VideoBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover scale-175 opacity-45 mix-blend-lighten blur-xs"
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
