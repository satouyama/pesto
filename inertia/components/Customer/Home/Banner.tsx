import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Banner({ data }: any) {
  if (!data?.content?.length) return null;

  return (
    <div className="relative container pt-8 pb-4 flex justify-center mb-10 z-0">
      <Swiper
        spaceBetween={8}
        pagination={{
          el: '.swiper-pagination',
          clickable: true,
        }}
        loop={data.length > 1}
        centeredSlides={false}
        modules={[Pagination]}
      >
        {data?.content?.map(
          (slider: { id: string; sliderImage: { url: string } }) =>
            slider.sliderImage.url && (
              <SwiperSlide
                key={slider.id}
                className="min-h-[312px] max-h-[312px] relative aspect-[4/1] rounded-2xl overflow-hidden"
              >
                <img
                  src={slider.sliderImage.url}
                  alt={slider.id}
                  className="absolute w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = '/banner_fallback.png')}
                />
              </SwiperSlide>
            )
        )}
      </Swiper>
      <div className="swiper-pagination" />
    </div>
  );
}
