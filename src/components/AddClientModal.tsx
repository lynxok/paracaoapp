import React, { useState, useEffect } from 'react';
import { UserPlus, X, AlertCircle, Plus } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import { useSettings } from '../context/SettingsContext';
import { Client } from '../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDni?: string;
  onClientAdded?: (client: Client) => void;
}

export function AddClientModal({ isOpen, onClose, initialDni = '', onClientAdded }: AddClientModalProps) {
  const { addClient } = useClients();
  const { insurances, addInsurance } = useSettings();

  const [dni, setDni] = useState('');
  const [dniError, setDniError] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obra social states
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('');
  const [isAddingNewInsurance, setIsAddingNewInsurance] = useState(false);
  const [newInsuranceName, setNewInsuranceName] = useState('');
  const [insuranceError, setInsuranceError] = useState('');

  const handleAddNewInsurance = () => {
    const trimmed = newInsuranceName.trim();
    if (!trimmed) {
      setInsuranceError('Ingrese un nombre para la obra social.');
      return;
    }
    const exists = insurances.some(i => i.name.trim().toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setInsuranceError(`La obra social "${trimmed}" ya existe en el sistema.`);
      return;
    }
    const newInsId = Date.now().toString();
    addInsurance({
      name: trimmed,
      active: true,
      coverages: []
    });
    setSelectedInsuranceId(newInsId);
    setIsAddingNewInsurance(false);
    setNewInsuranceName('');
    setInsuranceError('');
  };

  useEffect(() => {
    if (isOpen) {
      setDni(initialDni.replace(/\D/g, ''));
      setDniError('');
      setBirthDate('');
      setAge('');
    }
  }, [isOpen, initialDni]);

  if (!isOpen) return null;

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '');
    if (value !== numericValue) {
      setDniError('Ingresar solo números, sin puntos ni guiones.');
    } else {
      setDniError('');
    }
    setDni(numericValue);
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setBirthDate(date);
    if (date) {
      const today = new Date();
      const birthDateObj = new Date(date);
      let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge.toString() : '');
    } else {
      setAge('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const formData = new FormData(target);

    const firstName = (formData.get('firstName') as string)?.trim() || '';
    const lastName = (formData.get('lastName') as string)?.trim() || '';
    const phone = (formData.get('phone') as string)?.trim() || '';
    const email = (formData.get('email') as string)?.trim() || '';
    const insuranceId = selectedInsuranceId || (formData.get('insuranceId') as string) || '';
    const insurancePlan = (formData.get('insurancePlan') as string)?.trim() || '';
    const affiliateNumber = (formData.get('affiliateNumber') as string)?.trim() || '';

    const street = (formData.get('street') as string)?.trim() || '';
    const number = (formData.get('address_number') as string)?.trim() || '';
    const floor = (formData.get('address_floor') as string)?.trim() || '';
    const apartment = (formData.get('address_apartment') as string)?.trim() || '';

    const selectedInsurance = insurances.find(i => i.id === insuranceId);

    const newClientData = {
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      dni,
      phone,
      email,
      birthDate,
      age,
      address: {
        street,
        number,
        floor,
        apartment
      },
      insuranceId,
      insurance: selectedInsurance?.name || '',
      insurancePlan,
      affiliateNumber,
      lastVisit: new Date().toISOString().split('T')[0]
    };

    try {
      setIsSubmitting(true);
      const createdClient = await addClient(newClientData);
      if (onClientAdded && createdClient) {
        onClientAdded(createdClient);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Registrar Nuevo Cliente
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre *</label>
                <input 
                  name="firstName"
                  type="text" 
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                  placeholder="Ej: Juan" 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Apellido *</label>
                <input 
                  name="lastName"
                  type="text" 
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                  placeholder="Ej: Pérez" 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">DNI / Identificación *</label>
                <input 
                  type="text" 
                  value={dni}
                  onChange={handleDniChange}
                  inputMode="numeric"
                  className={`h-10 px-3 rounded-lg border ${dniError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-mono`} 
                  placeholder="12345678" 
                  required 
                />
                {dniError && <p className="text-[10px] text-red-500 font-medium">{dniError}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={handleBirthDateChange}
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Edad</label>
                <input 
                  type="text" 
                  readOnly 
                  value={age}
                  placeholder="Autocalculado"
                  className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800 w-full cursor-not-allowed text-slate-900 dark:text-white" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teléfono / WhatsApp *</label>
                <input 
                  name="phone"
                  type="tel" 
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                  placeholder="+54 9 ..." 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                <input 
                  name="email"
                  type="email" 
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" 
                  placeholder="ejemplo@correo.com" 
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Calle</label>
                <input name="street" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="Nombre de la calle" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:col-span-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Número</label>
                  <input name="address_number" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="123" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Piso</label>
                  <input name="address_floor" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="2do" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Dpto.</label>
                  <input name="address_apartment" type="text" className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white" placeholder="B" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Obra Social / Seguro Médico</label>
                  {!isAddingNewInsurance && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewInsurance(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nueva Obra Social
                    </button>
                  )}
                </div>

                {!isAddingNewInsurance ? (
                  <select 
                    name="insuranceId" 
                    value={selectedInsuranceId}
                    onChange={(e) => setSelectedInsuranceId(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm font-semibold"
                  >
                    <option value="">Particular / Sin Cobertura</option>
                    {insurances.filter(i => i.active !== false).map(ins => (
                      <option key={ins.id} value={ins.id}>{ins.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newInsuranceName}
                        onChange={(e) => {
                          setNewInsuranceName(e.target.value);
                          setInsuranceError('');
                        }}
                        placeholder="Nombre de la nueva Obra Social (ej: OSDE, PAMI)"
                        className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-1 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewInsurance}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shrink-0"
                      >
                        Guardar OS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewInsurance(false);
                          setNewInsuranceName('');
                          setInsuranceError('');
                        }}
                        className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                    {insuranceError && <p className="text-xs font-bold text-red-500">{insuranceError}</p>}
                  </div>
                )}

                {selectedInsuranceId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Plan (ej: 210, 310, A1)</label>
                      <input 
                        name="insurancePlan" 
                        type="text" 
                        className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-xs font-semibold" 
                        placeholder="Ej: Plan 210" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nº Afiliado</label>
                      <input 
                        name="affiliateNumber" 
                        type="text" 
                        className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-full focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white text-xs font-semibold" 
                        placeholder="Ej: 12345678" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar y Vincular Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
