import { useItems } from "../hooks/Fetchitems"
import { FoodCard } from "./FoodCard"
import { WaiterLoading } from "./Loading"

export const WaiterBody = () => {
    const { loading, items } = useItems()

    if (loading) {
        return (
            <WaiterLoading />
        )
    }

    return (
        <div className="flex justify-center items-center">
            <div className="grid grid-cols-3 gap-2 p-4">
                {items.map(item => <FoodCard
                    title={item.name}
                    price={item.price} />)}
            </div>
        </div>
    )
}