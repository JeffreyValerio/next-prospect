import Link from "next/link"

import { getProspect } from "@/actions/prospects/get-prospect";
import { IProspect } from "@/interfaces/prospect.interface"
import Image from "next/image"

import { BiSearch } from "react-icons/bi"
import { CiLocationOn } from "react-icons/ci";
import { GoPersonAdd } from "react-icons/go";
import { FiEdit } from "react-icons/fi";

export const Table = async () => {

    const prospects = await getProspect();

    return (
        <div>
            <div className="flex justify-between items-center gap-2 mb-2">
                <form action="" className="flex bg-white rounded w-full">
                    <input className="p-3 flex-1 rounded-l" type="text" placeholder="Buscar prospecto" />
                    <button type="submit" className="p-3">
                        <BiSearch />
                    </button>
                </form>

                <Link href={"/prospects/new"} className="text-xs bg-teal-600 text-white rounded-md p-2">
                    <GoPersonAdd size={24} className="flex-shrink-0" />
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border shadow-sm">
                    <thead className="">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                            <th className="sr-only">Tipificar</th>
                            <th className="sr-only">Coordenadas</th>
                            <th className="sr-only">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200 mb-8">
                        {prospects.map((p: IProspect, index: number) => (
                            <tr key={index} className="hover:shadow-md hover:bg-gray-200 transition duration-300 ease-in-out">
                                <td className="flex items-center px-4 py-3">
                                    <div className="w-10 h-10 overflow-hidden rounded-md">
                                        <Image className="img-responsive" src="img/user.svg" alt="" width={80} height={80} />
                                    </div>
                                    <span className="ml-3 text-sm text-gray-900">{p.firstName} {p.lastName}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-700">{p.phone1} {p.phone2}</td>
                                <td className="px-4 py-3 text-xs text-gray-700">{p.nId}</td>
                                <td className="px-4 py-3 text-xs text-gray-700">{p.address}</td>
                                <td className="px-4 py-3 text-xs text-gray-700">{p.assignedTo}</td>
                                <td className="px-4 py-3 text-xs text-gray-700">{p.customerResponse}</td>
                                <td className="px-4 py-3 text-xs text-gray-700" title={p.location}>
                                    {p.location ? (
                                        <Link href={`https://www.google.com/maps?q=${p.location}`} target="_blank" className="text-teal-600 hover:text-teal-800 transition duration-300 ease-in-out">
                                            <CiLocationOn size={20} className="flex-shrink-0" />
                                        </Link>
                                    ) : <></>}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-700">
                                    <div className="flex items-center justify-center">
                                        <Link href={`/prospects/${p.id}`} className="px-2 py-1">
                                            <FiEdit size={18} className="flex-shrink-0" />
                                        </Link>
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
