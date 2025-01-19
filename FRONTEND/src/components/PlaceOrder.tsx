export const PlaceOrder = () => {
    return (
        <div className="flex justify-center items-center p-2 fixed bottom-0 min-w-full bg-gray-900">
            <button type="button" className="flex gap-8  text-white bg-red-700 hover:bg-red-800  font-medium rounded-lg text-sm p-4 dark:bg-red-600 dark:hover:bg-red-700">Place Order
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="none">
                    <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    )
}