import { BrowserRouter, Route, Routes } from "react-router-dom"
import LoginPage from "./Pages/LoginPage"
import { AdminPage } from "./Pages/AdminPage"
import { WaiterPage } from "./Pages/WaiterPage"
import { Role } from "./Pages/LoginPage"
import { ProtectedRoute } from "./hooks/Protected"
import { KitchenPage } from "./Pages/KitchenPage"
import { AuthProvider } from "./hooks/Authcontext"

function App() {

  return (
    <>
      <AuthProvider>

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                
                  <AdminPage />
  
              }
            />
            <Route
              path="/waiter"
              element={
                <ProtectedRoute role={Role.WAITER}>
                  <WaiterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute role={Role.KITCHEN}>
                  <KitchenPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
