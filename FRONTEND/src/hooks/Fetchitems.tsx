import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"
import { DeleteItem, handleSave } from "../components/AdminBody"

export interface item{
    id : number,
    name : string,
    price : number,
    category : string,
}

export const useItems = () => {

    const [loading , setLoading] = useState(true)
    const [items, setItems] = useState<item[]>([])

    useEffect(()=>{
        axios.get(`${BACKEND_URL}/api/v1/menu/get`,{
            headers:{
                Authorization: localStorage.getItem('token')
            }
        })
        .then((res)=>{
            setItems(res.data.items)
            setLoading(false)
        })
    },[handleSave,DeleteItem])

    return {loading, items}
}