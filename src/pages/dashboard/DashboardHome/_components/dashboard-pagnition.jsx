import { ArrowLeft, ArrowRight, ArrowRightCircle, ArrowRightIcon, ChevronRight } from 'lucide-react'
import React from 'react'

const DashboardPagnition = () => {
  return (
     <div className="flex items-center   justify-center">
        {/* <div className="text-sm">1 صفحة من 4</div> */}
        <div className="flex items-center gap-2">
          <button className=" rounded-full p-2 border bg-primary text-white">
           <ChevronRight className="size-5 font-normal flex items-center justify-center" />
          </button>
          <button className="size-9 rounded-full border">4</button>
          <button className="size-9 rounded-full border">3</button>
          <button className="size-9 rounded-full border">2</button>
          <button className="size-9 rounded-full border">1</button>
        </div>
      </div>
  )
}

export default DashboardPagnition
