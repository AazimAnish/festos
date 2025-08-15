
export function DiscoverHero() {
  return (
    <div className="relative bg-background pt-10 pb-8">
      <div className="container mx-auto px-6 text-center">

        {/* Main heading with Apple typography */}
        <h1 className="font-primary font-black text-3xl md:text-4xl lg:text-5xl text-foreground mb-3 tracking-tight leading-[1.05]">
          Discover Your Next
          <br />
          <span className="text-primary">Great Event</span>
        </h1>

        {/* Subtitle */}
        <p className="font-secondary text-base md:text-lg text-muted-foreground mb-0 max-w-2xl mx-auto leading-relaxed">
          Explore curated experiences tailored just for you
        </p>
      </div>
    </div>
  )
}
