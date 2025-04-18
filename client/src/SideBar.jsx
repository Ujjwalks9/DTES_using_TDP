import { AppSidebar } from "@/components/Sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import MatrixInputByText from "./components/matrix/matrix_multiply_form"
import { Route, Routes } from "react-router-dom"
import HugeListSorter from "./components/sort/sub"
import FibonacciGenerator from "./components/fibbonachi/fibo-form"
import LandingPage from "./LandingPage"
import FactorialCalculator from "./components/factorial/factoiral_find"
import WordCounter from "./components/wordCount/word_counting_form"
import PrimeNumberCalculator from "./components/prime/prime_checking"
import GrayscaleImageProcessor from "./components/image/image_to_grayscale"

export default function SideBar() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Task Management System
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Make Your Calculation Easy</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/matrix" element={<MatrixInputByText />} />
            <Route path="/short" element={<HugeListSorter />} />
            <Route path="/fibo" element={<FibonacciGenerator />} />
            <Route path="/fact" element={<FactorialCalculator />} />
            <Route path="/wordcount" element={<WordCounter />} />
            <Route path="/prime" element={<PrimeNumberCalculator />} />
            <Route path="/image" element={<GrayscaleImageProcessor />} />
        </Routes>
        </div>
        
      </SidebarInset>
    </SidebarProvider>
  )
}
