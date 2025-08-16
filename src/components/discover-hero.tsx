
export function DiscoverHero() {
  return (
    <div className="relative bg-background pt-8 sm:pt-10 pb-6 sm:pb-8">
      <div className="container mx-auto px-4 sm:px-6 text-center">

        {/* Main heading with Apple typography */}
        <h1 className="font-primary font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-2 sm:mb-3 tracking-tight leading-[1.05]">
          Discover Your <span className="text-primary">Next</span>
          <br />
          <span className="text-primary">Great Event</span>
        </h1>

        {/* Subtitle */}
        <p className="font-secondary text-sm sm:text-base md:text-lg text-muted-foreground mb-0 max-w-2xl mx-auto leading-relaxed">
          Explore curated experiences tailored just for <span className="text-primary font-medium">you</span>
        </p>
      </div>
    </div>
  )
}
