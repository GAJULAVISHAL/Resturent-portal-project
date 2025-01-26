import { useState } from "react"

interface Item {
    title : string
    price : number
}
export const FoodCard = ({ title, price, onAdd, onSub }: {
    title: string,
    price: number,
    onAdd: (item : Item ) => void,
    onSub: (item : Item) => void
}) => {

    const [count, setCount] = useState<number>(0)

    const HandleAdd = ()=>{
        onAdd({title, price})
        setCount(count + 1)
    }

    const HandleSub = ()=>{
        onSub({title,price})
        if(count > 0){
            setCount(count - 1)
        }
    }

    return (
        <div className="min-w-fit">
            <div className="border rounded-lg shadow-md p-4 w-72 bg-white">

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
                <div className="flex bg-red-500 items-center mt-4">
                    <button className=" text-white px-4 py-2 rounded-lg " onClick={ HandleAdd } >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#ffffff" fill="none">
                            <path d="M12 4V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round" />
                            <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    {count}
                    <button className=" text-white px-4 py-2 rounded-lg" onClick={ HandleSub }>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#ffffff" fill="none">
                            <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}