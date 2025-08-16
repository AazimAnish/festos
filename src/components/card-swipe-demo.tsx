import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css/effect-cards"
import { EffectCards, Autoplay } from "swiper/modules"
import "swiper/css"
import { EventCard } from "./event-card"
import { SAMPLE_EVENTS } from "@/lib/data/sample-events"

// Take first 6 events for the carousel
const HERO_EVENTS = SAMPLE_EVENTS.slice(0, 6)

// Custom CSS for event cards in Swiper
const swiperStyles = `
  .swiper {
    width: 100%;
    padding-bottom: 40px;
  }
  
  .swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-3xl);
    font-size: 22px;
    font-weight: bold;
    color: var(--color-white);
    box-shadow: var(--shadow-apple-xl);
    transition: transform 0.3s ease;
  }
  
  .swiper-slide:hover {
    transform: translateY(-8px);
  }
  
  .swiper-slide .event-card {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-3xl);
  }
  
  @media (max-width: 640px) {
    .swiper {
      padding-bottom: 30px;
    }
    
    .swiper-slide {
      border-radius: var(--radius-2xl);
    }
    
    .swiper-slide .event-card {
      border-radius: var(--radius-2xl);
    }
  }
  
  @media (max-width: 480px) {
    .swiper {
      padding-bottom: 25px;
    }
    
    .swiper-slide {
      border-radius: var(--radius-xl);
    }
    
    .swiper-slide .event-card {
      border-radius: var(--radius-xl);
    }
  }
`;

const CardSwipeDemo = () => {
  return (
    <div className="w-full">
      <style>{swiperStyles}</style>
      <Swiper
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        effect={"cards"}
        grabCursor={true}
        loop={true}
        slidesPerView={"auto"}
        rewind={true}
        cardsEffect={{
          slideShadows: false,
          perSlideOffset: 8,
          perSlideRotate: 2,
        }}
        modules={[EffectCards, Autoplay]}
        className="w-full max-w-full"
      >
        {HERO_EVENTS.map((event) => (
          <SwiperSlide key={event.id}>
            <div className="w-full h-full rounded-3xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] event-card">
              <EventCard
                {...event}
                variant="hero"
                status="confirmed"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default CardSwipeDemo
