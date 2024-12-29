import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./Pages/Login"
import { Admin } from "./Pages/Admin"
import { Waiter } from "./Pages/Waiter"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/admin" element={<Admin/>} />
          <Route path="/waiter" element={<Waiter/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
