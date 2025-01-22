import { useItems } from "../hooks/Fetchitems"
import { FoodCard } from "./FoodCard"
import { WaiterLoading } from "./Loading"
import { useState, useEffect } from "react"

interface Item {
    id: number,
    name: string,
    price: number
}
export const WaiterBody = () => {
    const { loading, items } = useItems()
    const [selectedItems, setSelectedItems] = useState<Item[]>([])
    const [totalPrice, setTotalPrice] = useState<number>(0)

    const HandleAddItem = (item: Item) => {
        setSelectedItems((prevItems) => {
            const updatedItems = [...prevItems, item];
            return updatedItems;
        });
        setTotalPrice((prevTotal) => prevTotal + item.price)
    };

    const HandleSubItem = (item: Item) => {
        setSelectedItems((prevItems) => {
            const itemIndex = prevItems.findIndex(
                (Pitem) => Pitem.name === item.name && Pitem.price === item.price
            );
            if (itemIndex !== -1) {
                const newItems = [...prevItems];
                newItems.splice(itemIndex, 1);
                return newItems;
            }
            return prevItems;
        });
        setTotalPrice((prevTotal) => prevTotal - item.price);
    }

    useEffect(() => {
        console.log(`Updated Total Price: ₹${totalPrice}`);
        console.log("Updated Selected Items:", selectedItems);
    }, [totalPrice, selectedItems]);

    if (loading) {
        return (
            <WaiterLoading />
        )
    }

    return (
        <div className="flex justify-center items-center">
            <div className="grid grid-cols-3 gap-2 p-4">
                {items.map((item) => (
                    <FoodCard
                        key={item.name}
                        title={item.name}
                        price={item.price}
                        onAdd={() => HandleAddItem(item)}
                        onSub={() => HandleSubItem(item)}
                    />
                ))}
            </div>
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Selected Items:</h2>
                {selectedItems.length > 0 ? (
                    <ul>
                        {selectedItems.map((item, index) => (
                            <li
                                key={index}
                                className="flex justify-between py-1 border-b last:border-none"
                            >
                                <span>{item.name}</span>
                                <span>₹{item.price}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No items added yet.</p>
                )}
                <h3 className="text-lg font-bold mt-4">Total: ₹{totalPrice}</h3>
            </div>
        </div>
    )
}