// "use client"

// import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
// import Link from "next/link"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"

// // Menu items
// const items = [
//   { title: "Home", url: "/", icon: Home },
//   { title: "Search talents", url: "/inbox", icon: Inbox },
//   { title: "Buy Media", url: "/calendar", icon: Calendar },
//   { title: "Chat with AI", url: "/search", icon: Search },
//   { title: "Settings", url: "/settings", icon: Settings },
// ]

// export function AppSidebar() {
//   return (
//     <Sidebar 
//     className="fixed left-0 top-0 h-full z-40"
//     variant="floating">
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Application</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {items.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <Link href={item.url} className="flex items-center gap-2">
//                       <item.icon className="h-4 w-4" />
//                       <span>{item.title}</span>
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   )
// }
