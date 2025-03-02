import { useState } from 'react';

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' // Default role
  });

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your API
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Delish</h2>
          <p className="text-gray-400">
            Create an account to access the restaurant menu portal.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-white mb-2">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="admin">Admin</option>
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
            </select>
          </div>
          
          <div className="text-right">
            <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
              Forgot Password?
            </a>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-150"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};
