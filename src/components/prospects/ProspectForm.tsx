'use client'

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Controller, useForm } from 'react-hook-form';
import { createUpdateProspect } from '@/actions/prospects/create-update'
import { Input } from '../ui/input';
import { IProspect } from '@/interfaces/prospect.interface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';
import { Bounce, toast } from 'react-toastify';
import { IUser } from '@/interfaces/user.interface';
import { Label } from '../ui/label';
import tipifications from "@/data/tipification.json";

function capitalize(str: string): string {
    return str
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface Props {
    prospect: Partial<IProspect>;
    title: string
    users: IUser[];
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
    assignedAt?: string;
    id?: string;
}

export const ProspectForm = ({ prospect, title, users }: Props) => {

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormInputs>({
        defaultValues: {
            ...prospect
        }
    })

    const [isLoading, setIsLoading] = useState(false);

    const user = useUser()
    const isAdmin = user?.user?.publicMetadata?.role === 'admin';

    const router = useRouter()

    const onSubmit = async (data: FormInputs) => {

        setIsLoading(true);

        try {
            const formData = new FormData()
            const { id, ...prospectToSave } = data

            // Obtener la fecha actual para "assignedAt"
            const assignedAt = new Date().toLocaleString("es-CR", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });

            if (id) {
                formData.append('id', id);
            }

            formData.append('firstName', capitalize(prospectToSave.firstName.trim()));
            formData.append('lastName', capitalize(prospectToSave.lastName.trim()));
            formData.append('nId', prospectToSave.nId);
            formData.append('phone1', prospectToSave.phone1);
            formData.append('phone2', prospectToSave.phone2 ?? '');
            formData.append('address', capitalize(prospectToSave.address));
            formData.append('location', prospectToSave.location?.trim() ?? '');
            formData.append('comments', prospectToSave.comments ?? '');

            formData.append('customerResponse', prospectToSave.customerResponse ?? 'Sin tipificar')
            formData.append('assignedTo', prospectToSave.assignedTo ?? 'Sin asignar')
            formData.append('assignedAt', assignedAt);

            const { ok, message } = await createUpdateProspect(formData, users)

            if (ok) {
                toast.success(message, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
                router.replace('/prospects');
            } else {
                alert(`${message}`)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false);
            reset();
        }
    }

    return (
        <section>
            <h2 className='mb-2 justify-center sm:justify-end items-center flex text-sm'>
                {title} {prospect.firstName ? <p className='ml-2 font-bold'> {prospect.firstName} {prospect.lastName} </p> : ""}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 bg-white p-4 rounded'>
                {/* INFORMACION DE CONTACTO */}
                <fieldset>
                    <legend>Información personal</legend>
                    <section className="grid sm:grid-cols-2 lg:grid-cols-3 items-center gap-4">
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <Label
                                htmlFor="firstName"
                                className={cn("", {
                                    "text-[#ca1515]": errors.firstName,
                                })}
                            >
                                <span className="text-[#ca1515]">(*)</span>{" "}
                                {errors.firstName?.message
                                    ? errors.firstName?.message
                                    : "Nombre"}
                            </Label>
                            <Input
                                readOnly={!isAdmin}
                                {...register("firstName", {
                                    required: "El nombre es requerido",
                                })}
                                className={cn("capitalize", { "cursor-not-allowed": !isAdmin })}
                            />
                        </div>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <Label
                                htmlFor="lastName"
                                className={cn("", {
                                    "text-[#ca1515]": errors.lastName,
                                })}
                            >
                                {" "}
                                <span className="text-[#ca1515]">(*)</span>{" "}
                                {errors.lastName?.message
                                    ? errors.lastName?.message
                                    : "Apellidos"}{" "}
                            </Label>
                            <Input
                                readOnly={!isAdmin}
                                {...register("lastName", {
                                    required: "Los apellidos son requeridos",
                                })}
                                className={cn("capitalize", { "cursor-not-allowed": !isAdmin })}
                            />
                        </div>
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <Label
                                htmlFor="nId"
                                className={cn("", {
                                    "text-[#ca1515] ": errors.nId,
                                })}
                            >
                                <span className="text-[#ca1515]">(*)</span>{" "}
                                {errors.nId?.message
                                    ? errors.nId?.message
                                    : "Cédula de identidad o Dimex"}
                            </Label>
                            <Input
                                readOnly={!isAdmin}
                                {...register("nId", {
                                    required: "La cédula o Dimex es requerida",
                                })}
                                className={cn("", { "cursor-not-allowed": !isAdmin })}
                            />
                        </div>
                    </section>
                </fieldset>

                {/* CONTACTO */}
                <fieldset>
                    <legend>Contacto</legend>
                    <section className="grid sm:grid-cols-2 items-center gap-4">
                        <div className="flex flex-col flex-1 min-w-[200px]">
                            <Label
                                htmlFor="phone1"
                                className={cn("", {
                                    "text-[#ca1515] ": errors.phone1,
                                })}
                            >
                                <span className="text-[#ca1515]">(*)</span>{" "}
                                {errors.phone1?.message ? errors.phone1?.message : "Teléfono 1"}
                            </Label>
                            <Input
                                readOnly={!isAdmin}
                                type="tel"
                                {...register("phone1", {
                                    required: "El teléfono es requerido",
                                    pattern: {
                                        value: /^[0-9]{8}$/,
                                        message: "El teléfono debe tener 8 dígitos numéricos",
                                    },
                                })}
                                className={cn("", { "cursor-not-allowed": !isAdmin })}
                            />
                        </div>

                        <div className="flex flex-col flex-1">
                            <Label
                                htmlFor="phone1"
                                className={cn("", {
                                    "text-[#ca1515] ": errors.phone2,
                                })}
                            >
                                {errors.phone2?.message ? errors.phone2?.message : "Teléfono 2"}
                            </Label>
                            <Input
                                readOnly={!isAdmin}
                                type="tel"
                                {...register("phone2", {
                                    pattern: {
                                        value: /^[0-9]{8}$/,
                                        message: "El teléfono debe tener 8 dígitos numéricos",
                                    },
                                })}
                                className={cn("", { "cursor-not-allowed": !isAdmin })}
                            />
                        </div>
                    </section>
                </fieldset>

                {/* UBICACION */}
                <fieldset>
                    <legend>Ubicación</legend>
                    <section className="grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <Label
                                htmlFor="address"
                                className={cn("", {
                                    "text-[#ca1515] ": errors.firstName,
                                })}
                            >
                                <span className="text-[#ca1515]">(*)</span>{" "}
                                {errors.address?.message
                                    ? errors.address?.message
                                    : "Dirección"}
                            </Label>
                            <Textarea
                                readOnly={!isAdmin}
                                {...register("address", {
                                    required: "La dirección es requerida",
                                })}
                                className={cn("", { "cursor-not-allowed": !isAdmin })}
                            />
                        </div>
                        <div className="flex flex-col flex-1 w-full">
                            <Label htmlFor="location" className="">
                                Coordenadas
                            </Label>

                            <Input readOnly={!isAdmin}
                                {...register("location")}
                                className={cn("", { "cursor-not-allowed": !isAdmin })}
                            />
                            {prospect?.location?.length ? (
                                <Link
                                    href={`https://www.google.com/maps?q=${prospect?.location}`}
                                    target="_blank"
                                    className="flex text-xs text-teal-600 hover:text-teal-800 transition duration-300 ease-in-out"
                                >
                                    Ver en el mapa
                                </Link>
                            ) : (
                                <></>
                            )}
                        </div>
                    </section>
                </fieldset>

                <fieldset>
                    <legend>Información adicional</legend>
                    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="">
                            <Label htmlFor="comments" className="">
                                Comentarios
                            </Label>
                            <Textarea {...register("comments")} />
                        </div>

                        <div className="">
                            <Label htmlFor="assignedTo" className="">
                                Asignado a
                            </Label>
                            <Controller
                                name="assignedTo"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user: IUser) => (
                                                <SelectItem key={user.id} value={user.fullName}>
                                                    {user.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div>
                            <Label htmlFor="customerResponse" className="">
                                Tipificar
                            </Label>
                            <Controller
                                name="customerResponse"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tipifications.map((t, index) => (
                                                <SelectItem key={index} value={t.name}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </section>
                </fieldset>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Regresar
                    </Button>
                    <Button
                        type="submit"
                        className="w-full flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin border-2 border-t-transparent rounded-full w-4 h-4 border-white mr-2" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar prospecto"
                        )}

                    </Button>
                </div>
            </form>
        </section>
    )
}