import React, { useState } from 'react';
import { useItems } from '../hooks/Fetchitems';
import { Items } from './Items';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export const handleSave = (id: number, name: string, price: number) => {
  axios.put(`${BACKEND_URL}/api/v1/menu/updateItem`, { id, name, price },{
    headers:{
      Authorization : localStorage.getItem('token')
    }
  })
}

export const DeleteItem = (id : number)=>{
  axios.delete(`${BACKEND_URL}/api/v1/menu/deleteItem/${id}`,{
    headers :{
      Authorization : localStorage.getItem("token")
    }
  })
}
const AdminBody: React.FC = () => {
  const { loading, items } = useItems();
  const [activeTab, setActiveTab] = useState('All');

  const filteredItems =
    activeTab === 'All'
      ? items
      : items.filter((item) => item.category === activeTab);
  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Menu</h1>
      <div className="flex space-x-6 mb-6 border-b border-gray-700">
        {['All', ...new Set(items.map((item) => item.category as string))].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {filteredItems.map((item) => (
        <Items
          key={item.id} // Ensure each item has a unique key
          name={item.name}
          price={item.price}
          onSave={(newName, newPrice) => { handleSave(item.id, newName, newPrice) }}
          onDelete={()=>{DeleteItem(item.id)}}
        />
      ))}
    </div>
  );
};

export default AdminBody;
