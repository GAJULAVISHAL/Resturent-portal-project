// export const Workers = () => {
//     return (
//         <div>
//             <div className="flex flex-col items-center">
//                 {owner && <UserCard user={owner} />}
//                 <div className="flex">
//                     {managers.map((manager) => (
//                         <div key={manager.id}>
//                             <UserCard user={manager} />
//                             <div className="flex">
//                                 {waiters
//                                     .filter((waiter) => waiter.managerId === manager.id)
//                                     .map((waiter) => (
//                                         <UserCard key={waiter.id} user={waiter} />
//                                     ))}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     )
// }

// const UserCard = ({ user }) => (
//     <div className="border rounded-lg p-4 shadow-md text-center">
//       <img src={user.imageUrl} alt={user.name} className="w-16 h-16 rounded-full mx-auto" />
//       <p className="font-bold">{user.name}</p>
//       <p className="text-sm text-gray-500">{user.role}</p>
//       <span className={`px-2 py-1 rounded-full text-xs ${user.status === "ALWAYS_ACTIVE" ? "bg-green-200" : "bg-gray-200"}`}>
//         {user.status.replace("_", " ")}
//       </span>
//     </div>
//   );