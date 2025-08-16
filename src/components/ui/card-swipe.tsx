"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css/effect-cards"
import { EffectCards } from "swiper/modules"
import "swiper/css"
import { Autoplay } from "swiper/modules"

interface CarouselProps {
  images: { src: string; alt: string }[]
  autoplayDelay?: number
  slideShadows?: boolean
}

export const CardSwipe: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 2000,
  slideShadows = false,
}) => {
  // Limit to 6 images for better performance
  const limitedImages = images.slice(0, 6);

  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 40px;
  }
  
  .swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-2xl);
    font-size: 22px;
    font-weight: bold;
    color: var(--color-white);
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
    border-radius: var(--radius-xl);
  }
  
  @media (max-width: 640px) {
    .swiper {
      padding-bottom: 30px;
    }
    
    .swiper-slide {
      border-radius: var(--radius-lg);
    }
    
    .swiper-slide img {
      border-radius: var(--radius-md);
    }
  }
  
  @media (max-width: 480px) {
    .swiper {
      padding-bottom: 25px;
    }
    
    .swiper-slide {
      border-radius: var(--radius-md);
    }
    
    .swiper-slide img {
      border-radius: var(--radius-sm);
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
        modules={[EffectCards, Autoplay]}
        className="w-full max-w-full"
      >
        {limitedImages.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full rounded-3xl overflow-hidden">
              <Image
                src={image.src}
                width={400}
                height={500}
                className="w-full h-full object-cover rounded-2xl"
                alt={image.alt}
                priority={index < 2}
                loading={index < 2 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
