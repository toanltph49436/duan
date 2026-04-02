import { useEffect } from "react"

import FeaturedDestination from "./Main/FeaturedDestination"
import Internatinal from "./Main/Internatinal"
import News from "./Main/News"
import TourIn from "./Main/TourIn"

import HotelPromotion from "./Main/HotelPromotion"
import BannerWithAboutUs from "./Main/About"

const LayoutHome = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (

    <div style={{ background: 'transparent' }}>
      <BannerWithAboutUs/>
      <Internatinal/>
      <FeaturedDestination/>
      <HotelPromotion/>
      <TourIn/>
      <News/>
    </div>
  )
}

export default LayoutHome
