import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp, Filter, Search } from 'lucide-react'
const Filter = () => {
  return (
     <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="" className="h-9 rounded-full! px-3">كل التصنيف</Button>
        <Button variant="outline" className="h-9 rounded-full! px-3">قيد المراجعة</Button>
        <Button variant="outline" className="h-9 rounded-full! px-3">نشط</Button>
        <Button variant="outline" className="h-9 rounded-full! px-3">غير نشط</Button>
        <Button variant="outline" className="h-9 rounded-full! px-3">محظور</Button>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="outline" className=" rounded-full! font-bold text-primary border border-primary px-1 flex items-center gap-1">
         <ArrowDownUp className="size-3 font-bold text-primary" />
          فرز
        </Button>
        <div className="relative w-80">
          <Input
            className="h-9 w-full rounded-full! bg-gray-100 ps-9 focus:outline-none! border-none pe-3 text-sm"
            placeholder="بحث"
          />
          <Search className="absolute text-gray-400  start-3 top-1/2 -translate-y-1/2 size-4" />
        </div>
      </div>
      </div>
  )
}

export default Filter