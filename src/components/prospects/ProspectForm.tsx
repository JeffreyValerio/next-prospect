'use client'

import { createUpdateProspect } from '@/actions/prospects/create-update'
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { IProspect } from '@/interfaces/prospect.interface';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Props {
    prospect: Partial<IProspect>;
    title: string
    users: {
        id: string;
        email: string;
        fullName: string;
    }[];
}

interface FormInputs {
    firstName: string;
    lastName: string;
    nId: string;
    phone1: string;
    phone2?: string;
    address: string;
    location?: string;
    comments?: string;
    customerResponse?: string;
    assignedTo?: string;
    id?: string;
}

export const ProspectForm = ({ prospect, title, users }: Props) => {

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormInputs>({
        defaultValues: {
            ...prospect
        }
    })

    const router = useRouter()

    const onSubmit = async (data: FormInputs) => {

        try {
            const formData = new FormData()
            const { id, ...prospectToSave } = data

            if (id) {
                formData.append('id', id);
            }

            formData.append('firstName', prospectToSave.firstName)
            formData.append('lastName', prospectToSave.lastName)
            formData.append('nId', prospectToSave.nId)
            formData.append('phone1', prospectToSave.phone1)
            formData.append('phone2', prospectToSave.phone2 ?? '')
            formData.append('address', prospectToSave.address)
            formData.append('location', prospectToSave.location ?? '')
            formData.append('comments', prospectToSave.comments ?? '')
            formData.append('customerResponse', prospectToSave.customerResponse ?? 'Sin asignar')
            formData.append('assignedTo', prospectToSave.assignedTo ?? 'Sin asignar')

            const { ok, message } = await createUpdateProspect(formData, users)

            if (ok) {
                alert(`${message}`)
            } else {
                alert(`${message}`)
            }
        } catch (error) {
            console.log(error)
        } finally {
            reset()
        }
    }

    return (
        <section>
            <h2 className='mb-2 justify-end items-center flex text-sm'>
                {title} {prospect.firstName ? <p className='ml-2 font-bold'> {prospect.firstName} {prospect.lastName} </p> : ""}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 bg-white p-4 rounded'>
                <fieldset className='flex flex-col gap-2 p-4 border rounded-md shadow-sm'>
                    <legend>Información personal</legend>
                    <section className='flex flex-wrap items-center gap-4'>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label
                                htmlFor="firstName"
                                className={cn("text-xs text-gray-600", {
                                    "text-[#ca1515] ": errors.firstName,
                                })}> Nombre <span className='text-[#ca1515]'>(*)</span>
                            </label>
                            <Input {...register('firstName', { required: "El nombre es requerido", })} placeholder='Christian' />
                        </div>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="lastName" className={cn("text-xs text-gray-600", {
                                "text-[#ca1515]": errors.lastName,
                            })}>Apellidos <span className='text-[#ca1515]'>(*)</span> </label>
                            <Input {...register('lastName', { required: "Los apellidos son requeridos", })} placeholder='Valerio Angulo' />
                        </div>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="nId" className={cn("text-xs text-gray-600", {
                                "text-[#ca1515] ": errors.nId,
                            })}>Cédula de identidad o Dimex  <span className='text-[#ca1515]'>(*)</span></label>
                            <Input {...register('nId', { required: "La cédula es requerida", })} placeholder='012345678' />
                        </div>
                    </section>
                </fieldset>

                <fieldset className='flex flex-col gap-2 p-4 border rounded-md shadow-sm'>
                    <legend>Contacto</legend>

                    <section className='flex flex-wrap items-center gap-4'>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="phone1" className={cn("text-xs text-gray-600", {
                                "text-[#ca1515] ": errors.phone1,
                            })}>Teléfono 1  <span className='text-[#ca1515]'>(*)</span></label>
                            <Input {...register('phone1', { required: "El teléfono es requerido", })} placeholder='87654321' />
                        </div>

                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="phone2" className='text-xs text-gray-600'>Teléfono 2</label>
                            <Input {...register('phone2')} placeholder='87654321' />
                        </div>
                    </section>


                </fieldset>

                <fieldset className='flex flex-col gap-2 p-4 border rounded-md shadow-sm'>
                    <legend>Ubicación</legend>

                    <section className='flex flex-wrap items-center gap-4'>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="address" className={cn("text-xs text-gray-600", {
                                "text-[#ca1515] ": errors.firstName,
                            })}>Dirección  <span className='text-[#ca1515]'>(*)</span></label>
                            <Input {...register('address', { required: "La dirección es requerida", })} placeholder='San José, Moravia, La Trinidad' />
                        </div>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="location" className='text-xs text-gray-600'>Coordenadas</label>
                            <Input {...register('location')} placeholder='876534338, -938383838'
                            />
                        </div>
                    </section>
                </fieldset>

                <fieldset className='flex flex-col gap-2 p-4 border rounded-md shadow-sm'>
                    <legend>Información adicional</legend>

                    <section className='flex flex-wrap items-center gap-4'>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="comments" className='text-xs text-gray-600'>Comentarios</label>
                            <Input {...register('comments')} placeholder='El cliente solicita que se le llame a las 2:00pm' />
                        </div>


                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="assignedTo" className='text-xs text-gray-600'>Asignado a</label>
                            <Controller
                                name="assignedTo"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="min-w-[200px]">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(user => (
                                                <SelectItem key={user.id} value={user.fullName}>
                                                    {user.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <label htmlFor="customerResponse" className='text-xs text-gray-600'>Tipificar</label>
                            <Controller
                                name="customerResponse"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="min-w-[200px]">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Venta realizada">✅ Venta realizada</SelectItem>
                                            <SelectItem value="No interesado">No interesado</SelectItem>
                                            <SelectItem value="Llamar más tarde">Llamar más tarde</SelectItem>
                                            <SelectItem value="Sin respuesta">Sin respuesta</SelectItem>
                                            <SelectItem value="Número equivocado">Número equivocado</SelectItem>
                                            <SelectItem value="Dejó en visto">Dejó en visto</SelectItem>
                                            <SelectItem value="Reprogramar cita">Reprogramar cita</SelectItem>
                                            <SelectItem value="No volver a llamar">🚫 No volver a llamar</SelectItem>
                                            <SelectItem value="Interesado en información">Interesado en información</SelectItem>
                                            <SelectItem value="Cliente existente">Cliente existente</SelectItem>
                                            <SelectItem value="Referido">Referido</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </section>
                </fieldset>
                <div className="flex gap-2">
                    <Button type='submit' variant={'outline'} className='w-full' onClick={
                        () => {
                            router.back()
                        }
                    }>Regresar</Button>
                    <Button className='w-full'>Guardar prospecto</Button>
                </div>
            </form>
        </section>
    )
}