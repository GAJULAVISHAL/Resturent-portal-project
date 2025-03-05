import { useAuth } from "../hooks/Authcontext";
// import { useNavigate } from "react-router-dom";

export const AppBar = () => {
    // const navigate = useNavigate()
    const { logout } = useAuth();

    return (
        <nav className="bg-gray-800 text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    <div className="flex items-center">
                        <span className="text-xl font-bold">Delish</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* <div className="hidden md:flex space-x-6">
                            <a
                                href="http://localhost:5173/admin/Workers"
                                className="hover:text-gray-300 transition duration-150"
                                onClick={() => navigate('/admin/Workers')}

                            >
                                Workes
                            </a>
                        </div> */}

                        <div className="hidden md:flex space-x-6">
                            <a
                                href="http://localhost:5173/"
                                className="hover:text-gray-300 transition duration-150"
                                onClick={logout}

                            >
                                Logout
                            </a>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button
                            className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}