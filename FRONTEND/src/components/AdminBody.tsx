import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

// Define types for the menu data
interface MenuItem {
  id?: number; // Assuming items have unique IDs
  name: string;
  description: string;
  price: string;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface MenuData {
  [key: string]: MenuCategory[];
}

const AdminBody: React.FC = () => {

  const [menuData, setMenuData] = useState<MenuData>({});

  // Fetch menu data from the backend

  // Handle form input changes


  // Add new item to the menu by making a POST request to the backend
  
  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Menu</h1>
      
    </div>
  );
};

export default AdminBody;
