import Image from "next/image"

import { BiSearch } from "react-icons/bi"

export const UsersTable = () => {
    return (
        <div>
            <div className="border-b">
                <form action="" className="flex mb-2 bg-white rounded">
                    <input className="p-3 flex-1 rounded-l" type="text" placeholder="Buscar usuario" />
                    <button type="submit" className="p-3">
                        <BiSearch />
                    </button>
                </form>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border shadow-sm">
                    <thead className="">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modificado</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sr-only">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200 mb-8">
                        {[...Array(5)].map((_, index) => (
                            <tr key={index} className="hover:shadow-md hover:bg-gray-200 transition duration-300 ease-in-out">
                                <td className="flex items-center px-4 py-3">
                                    <div className="w-10 h-10 overflow-hidden rounded-md">
                                        <Image className="img-responsive" src="img/user.svg" alt="" width={80} height={80} />
                                    </div>
                                    <span className="ml-3 text-sm text-gray-900">Michael Valerio Angulo</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-700">Admin</td>
                                <td className="px-4 py-3 text-xs text-gray-700">cvalerio@gmail.com</td>
                                <td className="px-4 py-3 text-xs text-gray-700">Rigoberto Araya</td>
                                <td className="px-4 py-3 text-xs text-gray-700">Christian Valerio</td>
                                <td className="px-4 py-3 text-xs text-gray-700">
                                    <div className="flex items-center justify-center">
                                        <button className="bg-teal-600 text-white px-2 py-1 rounded-md mr-2">Editar</button>
                                        <button className="bg-red-600 text-white px-2 py-1 rounded-md">Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
