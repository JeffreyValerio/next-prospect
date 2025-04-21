import { CiMoneyCheck1 } from "react-icons/ci";
import { PiUserSoundFill } from "react-icons/pi";

import { getProspect } from "@/actions/prospects/get-prospect";

export default async function HomePage() {

  const prospects = await getProspect();

  return (
    <div className="flex items-center gap-4">
      <div className="bg-white p-4 w-full rounded">
        <h1 className="text-2xl mb-4 flex items-center gap-2">
          <PiUserSoundFill />
          Usuarios
        </h1>
        <p className="text-2xl font-bold">283,838</p>
      </div>

      <div className="bg-white p-4 w-full rounded">
        <h1 className="text-2xl mb-4 flex items-center gap-2">
          <PiUserSoundFill />
          Prospectos
        </h1>
        <p className="text-2xl font-bold">
          {prospects.length}{" "} 
        </p>
      </div>

      <div className="bg-white p-4 w-full rounded">
        <h1 className="text-2xl mb-4 flex items-center gap-2">
          <CiMoneyCheck1 />
          Ventas
        </h1>
        <p className="text-2xl font-bold">$283,838</p>
      </div>

      <div className="bg-white p-4 w-full rounded">
        <h1 className="text-2xl mb-4 flex items-center gap-2">
          <CiMoneyCheck1 />
          Sin asignar
        </h1>
        <p className="text-2xl font-bold">83,838</p>
      </div>
    </div>
  );
}