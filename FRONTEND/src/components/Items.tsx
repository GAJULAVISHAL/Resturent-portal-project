import { PencilIcon } from "./Pencil";
interface ItemProps {
    name: string;

    price: number;
}

export const Items = ({
    name,
    price
}: ItemProps) => {
    return (
        <div className="flex items-center gap-4 bg-[#141414] px-4 min-h-[72px] py-2 justify-between rounded-lg p-4 m-4">
            <div className="flex flex-col justify-center">
                <p className="text-[#FFFFFF] text-base font-medium leading-normal line-clamp-1">{name}</p>
            </div>
            <div className="flex gap-5">
                <div className="shrink-0"><p className="text-[#FFFFFF] text-base font-normal leading-normal">RS - {price}</p></div>
                <div>
                    <PencilIcon />
                </div>
            </div>
        </div>
    )
}