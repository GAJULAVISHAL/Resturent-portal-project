export const AppBar = () => {
    return (
        <nav className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <span className="text-xl font-bold">Delish</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex space-x-6">
                        <a
                            href="#dashboard"
                            className="hover:text-gray-300 transition duration-150"
                        >
                            Dashboard
                        </a>
                        <a href="#orders" className="hover:text-gray-300 transition duration-150">
                            Orders
                        </a>
                        <a href="#menu" className="hover:text-gray-300 transition duration-150">
                            Menu
                        </a>
                        <a
                            href="#payments"
                            className="hover:text-gray-300 transition duration-150"
                        >
                            Payments
                        </a>
                        <a
                            href="#settings"
                            className="hover:text-gray-300 transition duration-150"
                        >
                            Settings
                        </a>
                    </div>



                    {/* Mobile Menu Button */}
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