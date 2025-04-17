import { Route, Routes } from "react-router-dom"
import SideBar from "./SideBar"
import { Toaster } from "@/components/ui/sonner";



function App() {

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/*" element={<SideBar />} />
      </Routes>
    </>
  )
}

export default App
