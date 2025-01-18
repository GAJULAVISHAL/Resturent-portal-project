import { useState } from 'react';

export const ItemForm = ({ HandleCancel ,HandleSubmit }: {
    HandleCancel: () => void,
    HandleSubmit : ()=> void
}) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: ''
    });

    const categories = [
        'JUICE',
        'MILKSHAKE',
        'SMOOTHIE',
        'SALAD',
        'SHARJAH',
        'LASSI',
        'MOJITO',
        'FALOODA',
        'CHAAT',
        'FRIES'
    ];

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="w-full max-w-md mx-auto p-6 bg-gray-700 text-black rounded-lg shadow-md">
                <form onSubmit={HandleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-white">
                            Item Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            onChange={(e)=>{
                                setFormData({
                                    ...formData,
                                    name : e.target.value
                                })
                            }}
                            className="w-full px-3 py-2 bg-black text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter item name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category" className="block text-sm font-medium text-white">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            onChange={(e)=>{
                                setFormData({
                                    ...formData,
                                    category : e.target.value
                                })
                            }}
                            className="w-full px-3 py-2 bg-black text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="price" className="block text-sm font-medium text-white">
                            Price
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            onChange={(e)=>{
                                setFormData({
                                    ...formData,
                                    price : e.target.value
                                })
                            }}
                            className="w-full px-3 py-2 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-black"
                            placeholder="Enter price"
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div className='flex gap-2'>
                        <button
                            type="submit"
                            className="w-full bg-gray-700 border border-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Save Item
                        </button>

                        <button
                            type="submit"
                            className="w-full bg-gray-700 border border-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            onClick={HandleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};