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
import { useState, useMemo, useCallback } from 'react';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';
import { Bounce, toast } from 'react-toastify';
import { IUser } from '@/interfaces/user.interface';
import { Label } from '../ui/label';
import { ButtonLoading } from '../ui/loading';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

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

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormInputs>({
        defaultValues: {
            ...prospect
        }
    })

    const [isLoading, setIsLoading] = useState(false);

    const user = useUser()
    const isAdmin = user?.user?.publicMetadata?.role === 'admin';

    const router = useRouter()

    // Memoizar la preparación de datos para evitar recálculos innecesarios
    const prepareFormData = useCallback((data: FormInputs) => {
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

        return formData;
    }, []);

    const onSubmit = useCallback(async (data: FormInputs) => {
        setIsLoading(true);

        try {
            const formData = prepareFormData(data);
            const { ok, message } = await createUpdateProspect(formData, users)

            if (ok) {
                toast.success(message, {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
                // Usar push en lugar de replace para mejor navegación
                router.push('/prospects');
            } else {
                toast.error(message, {
                    position: "bottom-right",
                    autoClose: 4000,
                    theme: "dark",
                });
            }
        } catch (error) {
            console.error('Error saving prospect:', error);
            toast.error('Error al guardar el prospecto. Inténtalo de nuevo.', {
                position: "bottom-right",
                autoClose: 4000,
                theme: "dark",
            });
        } finally {
            setIsLoading(false);
            // No resetear automáticamente para evitar pérdida de datos
        }
    }, [prepareFormData, users, router]);

    // Memoizar las opciones de tipificación para evitar recreación en cada render
    const customerResponseOptions = useMemo(() => [
        { value: "Venta realizada", label: "✅ Venta realizada", color: "bg-green-100 text-green-800" },
        { value: "No interesado", label: "❌ No interesado", color: "bg-red-100 text-red-800" },
        { value: "Llamar más tarde", label: "📞 Llamar más tarde", color: "bg-orange-100 text-orange-800" },
        { value: "Sin respuesta", label: "🔇 Sin respuesta", color: "bg-gray-100 text-gray-800" },
        { value: "Número equivocado", label: "📱 Número equivocado", color: "bg-yellow-100 text-yellow-800" },
        { value: "Dejó en visto", label: "👀 Dejó en visto", color: "bg-blue-100 text-blue-800" },
        { value: "Reprogramar cita", label: "📅 Reprogramar cita", color: "bg-purple-100 text-purple-800" },
        { value: "No volver a llamar", label: "🚫 No volver a llamar", color: "bg-red-100 text-red-800" },
        { value: "Interesado en información", label: "ℹ️ Interesado en información", color: "bg-blue-100 text-blue-800" },
        { value: "Cliente existente", label: "👤 Cliente existente", color: "bg-green-100 text-green-800" },
        { value: "Referido", label: "👥 Referido", color: "bg-indigo-100 text-indigo-800" },
        { value: "Permanencia", label: "⏰ Permanencia", color: "bg-orange-100 text-orange-800" },
        { value: "Seguimiento", label: "🔄 Seguimiento", color: "bg-cyan-100 text-cyan-800" },
        { value: "Buzón de voz", label: "🎙️ Buzón de voz", color: "bg-gray-100 text-gray-800" },
        { value: "Se envía información por WhatsApp", label: "💬 Se envía información por WhatsApp", color: "bg-green-100 text-green-800" },
        { value: "Corta la llamada", label: "📞 Corta la llamada", color: "bg-red-100 text-red-800" },
        { value: "No red", label: "📶 No red", color: "bg-gray-100 text-gray-800" },
        { value: "Trabajando", label: "💼 Trabajando", color: "bg-blue-100 text-blue-800" },
        { value: "El número no existe", label: "❌ El número no existe", color: "bg-red-100 text-red-800" },
        { value: "Incobrable", label: "💰 Incobrable", color: "bg-red-100 text-red-800" },
        { value: "Pendiente datos de venta", label: "⏳ Pendiente datos de venta", color: "bg-yellow-100 text-yellow-800" },
        { value: "Mala experiencia", label: "😞 Mala experiencia", color: "bg-red-100 text-red-800" },
        { value: "Contrata competencia", label: "🏢 Contrata competencia", color: "bg-orange-100 text-orange-800" },
        { value: "Alquila con los servicios incluidos", label: "🏠 Alquila con los servicios incluidos", color: "bg-gray-100 text-gray-800" },
    ], []);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {prospect.firstName && (
                        <p className="text-sm text-gray-600 mt-1">
                            Editando: <span className="font-medium">{prospect.firstName} {prospect.lastName}</span>
                        </p>
                    )}
                </div>
                {prospect.customerResponse && (
                    <Badge variant="secondary" className="text-xs">
                        Estado: {prospect.customerResponse}
                    </Badge>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Información Personal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            👤 Información Personal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="firstName"
                                    className={cn("text-sm font-medium", {
                                        "text-red-500": errors.firstName,
                                    })}
                                >
                                    <span className="text-red-500">*</span> Nombre
                                </Label>
                                <Input 
                                    disabled={!isAdmin}
                                    {...register('firstName', { required: "El nombre es requerido" })} 
                                    className={cn("capitalize", {
                                        "border-red-500 focus:border-red-500": errors.firstName
                                    })}
                                    placeholder="Ej: Juan Carlos"
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label 
                                    htmlFor="lastName" 
                                    className={cn("text-sm font-medium", {
                                        "text-red-500": errors.lastName,
                                    })}
                                >
                                    <span className="text-red-500">*</span> Apellidos
                                </Label>
                                <Input 
                                    disabled={!isAdmin} 
                                    {...register('lastName', { required: "Los apellidos son requeridos" })} 
                                    className={cn({
                                        "border-red-500 focus:border-red-500": errors.lastName
                                    })}
                                    placeholder="Ej: Pérez González"
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label 
                                    htmlFor="nId" 
                                    className={cn("text-sm font-medium", {
                                        "text-red-500": errors.nId,
                                    })}
                                >
                                    <span className="text-red-500">*</span> Cédula o Dimex
                                </Label>
                                <Input 
                                    disabled={!isAdmin} 
                                    {...register('nId', { required: "La cédula o Dimex es requerida" })} 
                                    className={cn({
                                        "border-red-500 focus:border-red-500": errors.nId
                                    })}
                                    placeholder="Ej: 123456789"
                                />
                                {errors.nId && (
                                    <p className="text-sm text-red-500">{errors.nId.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Información de Contacto */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            📞 Información de Contacto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label 
                                    htmlFor="phone1" 
                                    className={cn("text-sm font-medium", {
                                        "text-red-500": errors.phone1,
                                    })}
                                >
                                    <span className="text-red-500">*</span> Teléfono Principal
                                </Label>
                                <Input 
                                    disabled={!isAdmin} 
                                    type='tel' 
                                    {...register('phone1', {
                                        required: "El teléfono es requerido",
                                        pattern: {
                                            value: /^[0-9]{8}$/,
                                            message: "El teléfono debe tener 8 dígitos numéricos",
                                        }
                                    })} 
                                    className={cn({
                                        "border-red-500 focus:border-red-500": errors.phone1
                                    })}
                                    placeholder="Ej: 88887777"
                                />
                                {errors.phone1 && (
                                    <p className="text-sm text-red-500">{errors.phone1.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label 
                                    htmlFor="phone2" 
                                    className="text-sm font-medium"
                                >
                                    Teléfono Secundario
                                </Label>
                                <Input 
                                    disabled={!isAdmin} 
                                    type='tel' 
                                    {...register('phone2', {
                                        pattern: {
                                            value: /^[0-9]{8}$/,
                                            message: "El teléfono debe tener 8 dígitos numéricos",
                                        },
                                    })} 
                                    className={cn({
                                        "border-red-500 focus:border-red-500": errors.phone2
                                    })}
                                    placeholder="Ej: 88887778"
                                />
                                {errors.phone2 && (
                                    <p className="text-sm text-red-500">{errors.phone2.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Información de Ubicación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            📍 Información de Ubicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label 
                                    htmlFor="address" 
                                    className={cn("text-sm font-medium", {
                                        "text-red-500": errors.address,
                                    })}
                                >
                                    <span className="text-red-500">*</span> Dirección Completa
                                </Label>
                                <Textarea 
                                    disabled={!isAdmin} 
                                    {...register('address', { required: "La dirección es requerida" })} 
                                    className={cn("min-h-[80px]", {
                                        "border-red-500 focus:border-red-500": errors.address
                                    })}
                                    placeholder="Ej: San José, Costa Rica"
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500">{errors.address.message}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-sm font-medium">
                                    Coordenadas GPS
                                </Label>
                                <Input 
                                    disabled={!isAdmin} 
                                    {...register('location')} 
                                    placeholder="Ej: 9.9281, -84.0907"
                                />
                                {prospect?.location?.length ? (
                                    <Link 
                                        href={`https://www.google.com/maps?q=${prospect?.location}`} 
                                        target="_blank" 
                                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out"
                                    >
                                        🗺️ Ver en Google Maps
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Información Adicional */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            📝 Información Adicional
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="comments" className="text-sm font-medium">
                                Comentarios y Notas
                            </Label>
                            <Textarea 
                                {...register('comments')} 
                                className="min-h-[100px]"
                                placeholder="Agregar comentarios adicionales sobre el prospecto..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isAdmin && (
                                <div className="space-y-2">
                                    <Label htmlFor="assignedTo" className="text-sm font-medium">
                                        👤 Asignado a
                                    </Label>
                                    <Controller
                                        name="assignedTo"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar vendedor" />
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
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="customerResponse" className="text-sm font-medium">
                                    🎯 Estado del Prospecto
                                </Label>
                                <Controller
                                    name="customerResponse"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {customerResponseOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-6 mt-6 pb-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        ← Regresar
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <ButtonLoading size="sm" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <span>💾</span>
                                <span>Guardar Prospecto</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}