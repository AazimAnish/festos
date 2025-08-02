"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css/effect-cards"
import { EffectCards } from "swiper/modules"
import "swiper/css"
import { Autoplay, Pagination, Navigation } from "swiper/modules"

interface CarouselProps {
  images: { src: string; alt: string }[]
  autoplayDelay?: number
  slideShadows?: boolean
}

export const CardSwipe: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  slideShadows = false,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 60px;
  }
  
  .swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24px;
    font-size: 22px;
    font-weight: bold;
    color: #fff;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }
  
  .swiper-slide:hover {
    transform: translateY(-5px);
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
  }
  
  @media (max-width: 640px) {
    .swiper {
      padding-bottom: 40px;
    }
    
    .swiper-slide {
      border-radius: 20px;
    }
    
    .swiper-slide img {
      border-radius: 16px;
    }
  }
  `

  return (
    <div className="w-full h-full flex items-center justify-center">
      <style>{css}</style>
      <Swiper
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        effect={"cards"}
        grabCursor={true}
        loop={true}
        slidesPerView={"auto"}
        rewind={true}
        cardsEffect={{
          slideShadows: slideShadows,
          perSlideOffset: 8,
          perSlideRotate: 2,
        }}
        modules={[EffectCards, Autoplay, Pagination, Navigation]}
        className="w-full max-w-full"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full rounded-3xl overflow-hidden">
              <Image
                src={image.src}
                width={400}
                height={500}
                className="w-full h-full object-cover rounded-2xl"
                alt={image.alt}
                priority={index < 3}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
