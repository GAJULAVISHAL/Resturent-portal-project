export const FoodCard = ({title , price}:{
    title : string,
    price : number
}) => {
    return (
        <div className="min-w-fit">
            <div className="border rounded-lg shadow-md p-4 w-80 bg-white">

                {/* Title */}
                <h3 className="text-lg font-semibold mt-2">{title}</h3>

                {/* Price */}
                <div className="text-lg font-bold mt-2">₹{price}</div>

                {/* Image
                <div className="mt-4 relative">
                    <img
                        src="https://via.placeholder.com/150"
                        alt="Chicken Biryani"
                        className="rounded-lg w-full"
                    />
                </div> */}

                {/* Add Button */}
                <div className="flex items-center justify-between mt-4">
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                        ADD
                    </button>
                </div>
            </div>
        </div>
    )
}