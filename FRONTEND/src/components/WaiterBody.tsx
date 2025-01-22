import { useItems } from "../hooks/Fetchitems"
import { FoodCard } from "./FoodCard"
import { WaiterLoading } from "./Loading"
import { useState } from "react"

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
            console.log('Updated Selected Items:', updatedItems);
            return updatedItems;
        });
    };

    const HandleSubItem = (item:Item)=>{
        setSelectedItems((prevItems) => {
            const itemIndex = prevItems.findIndex(
              (pitem) => pitem.name === item.name && pitem.price === item.price
            );
            if (itemIndex !== -1) {
              // Remove only one instance of the item
              const newItems = [...prevItems];
              newItems.splice(itemIndex, 1);
              console.log(newItems)
              return newItems;
            }
            return prevItems;
          });
    }
    
    if (loading) {
        return (
            <WaiterLoading />
        )
    }

    return (
        <div className="flex justify-center items-center">
            <div className="grid grid-cols-3 gap-2 p-4">
                {items.map(item => <FoodCard
                    key={item.id}
                    title={item.name}
                    price={item.price}
                    onAdd={() => HandleAddItem(item)}
                    onSub={() => HandleSubItem(item)}
                />)
                }
            </div>
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Selected Items:</h2>
                {selectedItems.length > 0 ? (
                    <ul>
                        {selectedItems.map((item, index) => (
                            <li key={index} className="flex justify-between py-1">
                                <span>{item.name}</span>
                                <span>₹{item.price}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No items added yet.</p>
                )}
            </div>
        </div>
    )
}