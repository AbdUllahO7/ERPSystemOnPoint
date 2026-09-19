import {
  Users,
  Store,
  Package,
  Gavel,
  Video,
  Eye,
} from "lucide-react";

export default function DashboardHome() {
  const stats = [
    { icon: Gavel, label: "عدد المزادات", value: 55 },
    { icon: Users, label: "عدد العملاء", value: 55 },
    { icon: Package, label: "عدد بائعي المستلزمات", value: 55 },
    { icon: Store, label: "عدد بائعي المواشي", value: 55 },
  ];

  const streams = Array.from({ length: 4 }).map(() => ({
    title: "غنم نعيم أصيل",
    user: "محمد السالمي",
    views: 24,
  }));

  const auctions = Array.from({ length: 4 }).map(() => ({
    title: "غنم نعيم أصيل",
    user: "محمد السالمي",
    interactions: 24,
  }));

  return (
    <div className="p-4 space-y-6" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <s.icon className="size-6 text-white" />
              </div>
            </div>
            <div className="mt-6 text-sm">{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-background">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                <Video className="size-5 text-primary" />
              <h3 className="text-lg font-bold">البثوث الأكثر مشاهدة</h3>
            
            </div>
            <button className="text-sm">عرض الكل</button>
          </div>
       <div className="space-y-3 p-4 pt-0">
            {auctions.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Gavel className="size-5 text-primary font-bold" /> 
                <div className="flex flex-col ">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs">{item.user}</div>
                </div>
                
                </div>
                <div className="flex items-center gap-3 bg-primary/15 rounded-full text-primary">
                  <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
                      <Eye className="size-4" />
                    {item.interactions} مشاهدة
                  
                  </span>
                  {/* <Gavel className="size-5" /> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-background">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                 <Gavel className="size-5 text-primary" />
              <h3 className="text-lg font-bold">المزادات الأكثر تفاعلاً</h3>
           
            </div>
            <button className="text-sm">عرض الكل</button>
          </div>
          <div className="space-y-3 p-4 pt-0">
            {auctions.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Video className="size-5 text-primary font-bold" /> 
                <div className="flex flex-col ">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs">{item.user}</div>
                </div>
                
                </div>
                <div className="flex items-center gap-3 bg-primary/15 rounded-full text-primary">
                  <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
                      <Eye className="size-4" />
                    {item.interactions} مشاهدة
                  
                  </span>
                  {/* <Gavel className="size-5" /> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
