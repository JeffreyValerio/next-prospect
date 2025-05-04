import Link from 'next/link'

import { BsPersonBoundingBox } from 'react-icons/bs'
import { RxDashboard } from 'react-icons/rx'

export const Sidebar = () => {
    return (

        <aside className="p-6 flex flex-col min-w-[250px] h-full">

            <p className="uppercase text-xs text-gray-600 mb-4 tracking-wider">INICIO</p>

            <Link href="/" className="flex mb-3 capitalize font-medium text-sm hover:text-teal-600 transition ease-in-out duration-500">
                <RxDashboard size={20} className='mr-2' />
                Dashboard
            </Link>

            <Link href="/prospects" className="flex mb-3 capitalize font-medium text-sm hover:text-teal-600 transition ease-in-out duration-500">
                <BsPersonBoundingBox size={20} className='mr-2' />
                Prospectos
            </Link>

            <p className='text-xs absolute bottom-0 pb-6'>&copy; NextProspect <small>v 1.0.0</small></p>

        </aside>

    )
}
