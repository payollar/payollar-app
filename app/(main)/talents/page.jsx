// app/(main)/doctors/page.jsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/specialities";

export default async function DoctorsPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-white mb-2 text-center">
        Find Top Talents
      </h1>
      <p className="text-muted-foreground text-lg mb-8 text-center">
        Browse by specialty or view all available Talents
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-7xl">
        {SPECIALTIES.map((specialty) => (
         <Link key={specialty.name} href={`/talents/${specialty.name}`}>
         <Card className="group rounded-2xl overflow-hidden border border-emerald-900/20 hover:border-emerald-700/40 transition-all cursor-pointer bg-card">
           
           {/* Image area — fallback if no image */}
           <div className="relative w-full h-64 sm:h-72 lg:h-80 bg-muted">
             {specialty.image ? (
               <Image
                 src={specialty.image}
                 alt={specialty.name}
                 fill
                 className="object-cover"
                 sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 90vw"
                 priority
               />
             ) : (
               <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                 No Image
               </div>
             )}
           </div>
       
           <CardContent className="p-4 text-center">
             <h3 className="font-medium text-white">{specialty.name}</h3>
           </CardContent>
         </Card>
       </Link>
       
        ))}
      </div>
    </div>
  );
}
