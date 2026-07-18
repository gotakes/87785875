import { toast } from "sonner";
import React, { useState } from 'react';
import { Truck, ShieldCheck, Phone, Lock, ArrowRight, UserPlus, User, FileText, Upload, X } from 'lucide-react';
import { Driver } from '../types';

interface LoginProps {
  onLogin: (role: 'ADMIN' | 'DRIVER' | 'CLIENT', driverId?: string, password?: string) => void;
  onRegisterClient?: (client: {name: string, document: string, phone: string, password?: string}) => void;
  onRegister: (driver: Partial<Driver>) => void;
  onResetPassword?: (role: 'ADMIN' | 'DRIVER' | 'CLIENT', phone: string, document: string, newPassword: string) => Promise<boolean>;
}

export default function Login({ onLogin, onRegister, onRegisterClient, onResetPassword }: LoginProps) {
  const [role, setRole] = useState<'DRIVER' | 'ADMIN' | 'CLIENT'>('DRIVER');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [placa, setPlaca] = useState('');
  const [tipoVeiculo, setTipoVeiculo] = useState('');
  const [capacityWeight, setCapacityWeight] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [yearModel, setYearModel] = useState('');
  
  const [docCNH, setDocCNH] = useState<File | null>(null);
  const [docRG, setDocRG] = useState<File | null>(null);
  const [docAddress, setDocAddress] = useState<File | null>(null);
  const [docCnpj, setDocCnpj] = useState<File | null>(null);
  const [docClientAddress, setDocClientAddress] = useState<File | null>(null);
  const [docClientContract, setDocClientContract] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDocument, setResetDocument] = useState('');

  // Simple mask just for UX
  const formatPhone = (val: string) => {
    let r = val.replace(/\D/g, "");
    if (r.length > 11) r = r.slice(0, 11);
    if (r.length > 2) r = r.replace(/^(\d\d)(\d)/g, "($1) $2");
    if (r.length > 9) r = r.replace(/(\d{5})(\d)/, "$1-$2");
    return r;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');

    if (role === 'ADMIN') {
      const savedAdminPhone = localStorage.getItem('adminPhone') || '11910211515';
      const savedAdminPwd = localStorage.getItem('adminPwd') || '4907';
      
      if (isResetting) {
        if (cleanPhone === savedAdminPhone) {
          if (onResetPassword) {
             const success = await onResetPassword('ADMIN', cleanPhone, '', password);
             if (success) {
               import('sonner').then(({toast}) => toast.success('Senha de administrador atualizada!'));
               setIsResetting(false);
               setPassword('');
             } else {
               setError('Não foi possível redefinir a senha.');
             }
          }
        } else {
          setError('Telefone de administrador incorreto.');
        }
        return;
      }
      
      if (cleanPhone === savedAdminPhone && password === savedAdminPwd) {
        onLogin('ADMIN');
      } else {
        setError('Acesso negado. Credenciais de administrador inválidas.');
      }
    } else {
      if (cleanPhone.length < 10) {
        setError('Digite um número de telefone válido com DDD.');
        return;
      }
      
      if (!password || password.length < 4) {
        setError('A senha deve ter pelo menos 4 caracteres.');
        return;
      }
      
      if (isResetting) {
        if (!resetDocument) {
          setError('O CPF/CNPJ é obrigatório para redefinir a senha.');
          return;
        }
        if (onResetPassword) {
          const success = await onResetPassword(role, cleanPhone, resetDocument, password);
          if (success) {
            toast.success('Senha atualizada com sucesso!');
            setIsResetting(false);
            setPassword('');
          } else {
            setError('Usuário não encontrado. Verifique seu número e documento.');
          }
        }
        return;
      }

      if (isRegistering) {
        if (role === 'DRIVER') {
          if (!name || !cpf || !placa || !tipoVeiculo || !docCNH || !docRG || !docAddress) {
            setError('Preencha todos os campos obrigatórios e anexe todos os documentos.');
            return;
          }
        } else if (role === 'CLIENT') {
          if (!name || !cpf) {
            setError('Preencha todos os campos obrigatórios (Nome e CPF/CNPJ).');
            return;
          }
        }
        
        if (role === 'CLIENT' && onRegisterClient) {
          onRegisterClient({
            name,
            document: cpf,
            phone: cleanPhone,
            password
          });
        } else {
          onRegister({
            name,
            cpf,
            phone: cleanPhone,
            vehiclePlateHorse: placa,
            vehicleType: tipoVeiculo,
            capacityWeight,
            bodyType,
            yearModel,
            password,
            docCNH: docCNH?.name,
            docRG: docRG?.name,
            docAddress: docAddress?.name
          });
        }
        
        setIsRegistering(false);
      } else {
        // Logging in driver/client with phone number and password
        onLogin(role, cleanPhone, password);
      }
    }
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-x-hidden overflow-y-auto py-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900" style={{ transform: 'skewY(-6deg) translateY(-50%)' }}></div>
      
      <div className={`max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 relative z-10 ${isRegistering ? 'my-8' : ''}`}>
        
        <div className="p-8 pb-6 text-center">
          <Truck size={48} className="mx-auto mb-4 text-indigo-600" />
          <h1 className="text-3xl font-black font-display tracking-tight font-display text-slate-900 mb-2">El Nathan</h1>
          <p className="text-slate-500 font-medium">Gestão Inteligente de Transportes</p>
        </div>
        
        {/* Role Selector Tabs */}
        {!isRegistering && !isResetting && (
          <div className="px-8 mb-6">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => { setRole('CLIENT'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  role === 'CLIENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User size={16} /> Cliente
              </button>
              <button
                onClick={() => { setRole('DRIVER'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  role === 'DRIVER' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Truck size={16} /> Motorista
              </button>
              <button
                onClick={() => { setRole('ADMIN'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  role === 'ADMIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShieldCheck size={16} /> Admin
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 pb-8">
          <div className="space-y-5">
            
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nome Completo {role === 'CLIENT' && '/ Razão Social'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    CPF {role === 'CLIENT' && 'ou CNPJ'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-50"
                    />
                  </div>
                </div>
                
                {role === 'DRIVER' && (
                  <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Placa do Veículo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Truck size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="ABC-1234"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 truncate">
                      Tipo de Veículo
                    </label>
                    <select
                      value={tipoVeiculo}
                      onChange={(e) => setTipoVeiculo(e.target.value)}
                      className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-50"
                    >
                      <option value="">Selecione...</option>
                      <option value="PASSEIO">Passeio</option>
                      <option value="FIORINO">Fiorino</option>
                      <option value="VAN/HR">Van / HR</option>
                      <option value="VUC">VUC</option>
                      <option value="MÉDIO">Médio</option>
                      <option value="TOCO">Toco</option>
                      <option value="TRUCK">Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 truncate">
                      Capacidade (Kg)
                    </label>
                    <input
                      type="text"
                      placeholder="3.500kg"
                      value={capacityWeight}
                      onChange={(e) => setCapacityWeight(e.target.value)}
                      className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 truncate">
                      Carroceria
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Baú"
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 truncate">
                      Ano/Modelo
                    </label>
                    <input
                      type="text"
                      placeholder="2022/2022"
                      value={yearModel}
                      onChange={(e) => setYearModel(e.target.value)}
                      className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-2 pb-2 border-y border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-3">Documentação Obrigatória (Fotos)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group ${docCNH ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                      <Upload size={18} className={`${docCNH ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1`} />
                      <span className="text-xs font-medium text-slate-500 text-center truncate w-full px-1">{docCNH ? docCNH.name : 'CNH'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setDocCNH(e.target.files?.[0] || null)} />
                    </label>
                    <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group ${docRG ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                      <Upload size={18} className={`${docRG ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1`} />
                      <span className="text-xs font-medium text-slate-500 text-center truncate w-full px-1">{docRG ? docRG.name : 'RG'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setDocRG(e.target.files?.[0] || null)} />
                    </label>
                    <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group ${docAddress ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                      <Upload size={18} className={`${docAddress ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1`} />
                      <span className="text-xs font-medium text-slate-500 text-center truncate w-full px-1 text-balance leading-tight">{docAddress ? docAddress.name : 'Comp. Endereço'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setDocAddress(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
                  </>
                )}
              </>
            )}
                {role === 'CLIENT' && isRegistering && (
                  <div className="pt-2 pb-2 border-y border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-3">Documentação Obrigatória (Fotos/PDF)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group ${docCnpj ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                        <Upload size={18} className={`${docCnpj ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1`} />
                        <span className="text-xs font-medium text-slate-500 text-center w-full px-1 truncate leading-tight">{docCnpj ? docCnpj.name : 'Cartão CNPJ'}</span>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setDocCnpj(e.target.files?.[0] || null)} />
                      </label>
                      <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group ${docClientAddress ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                        <Upload size={18} className={`${docClientAddress ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1`} />
                        <span className="text-xs font-medium text-slate-500 text-center w-full px-1 truncate leading-tight">{docClientAddress ? docClientAddress.name : 'Comp. Endereço'}</span>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setDocClientAddress(e.target.files?.[0] || null)} />
                      </label>
                      <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors group ${docClientContract ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                        <Upload size={18} className={`${docClientContract ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-1`} />
                        <span className="text-xs font-medium text-slate-500 text-center w-full px-1 truncate leading-tight">{docClientContract ? docClientContract.name : 'Contrato/Proc.'}</span>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setDocClientContract(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Número de Celular
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <input
                  type="tel"
                  placeholder="(11) 90000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm bg-slate-50 ${
                    role === 'ADMIN' ? 'focus:ring-indigo-500 focus:border-indigo-500' : role === 'CLIENT' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {isResetting && role !== 'ADMIN' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  CPF/CNPJ (Confirmação)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={resetDocument}
                    onChange={(e) => setResetDocument(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder="Digite apenas números"
                  />
                </div>
              </div>
            )}
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  {isResetting ? 'Nova Senha' : `Senha ${isRegistering ? 'Nova' : ''}`}
                </label>
                {!isRegistering && !isResetting && (
                  <button
                    type="button"
                    onClick={() => { setIsResetting(true); setError(''); setPassword(''); }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm bg-slate-50 ${
                    role === 'ADMIN' ? 'focus:ring-indigo-500 focus:border-indigo-500' : role === 'CLIENT' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100">
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="flex items-start gap-3 mt-4 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <input 
                  type="checkbox" 
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                  Declaro que li, compreendo e aceito integralmente os <button type="button" onClick={() => setShowTermsModal(true)} className="text-indigo-600 font-bold hover:underline">Termos e Condições Jurídicas</button> {role === 'CLIENT' ? 'de prestação de serviços' : 'de autonomia, ausência de vínculo empregatício e rastreamento'}.
                </label>
              </div>
            )}
            <button
              type="submit"
              className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all ${
                role === 'ADMIN' 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : role === 'CLIENT' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isResetting ? (
                <>Redefinir Senha <ShieldCheck size={18} /></>
              ) : isRegistering ? (
                <>Criar Conta Segura <UserPlus size={18} /></>
              ) : (
                <>Entrar no Sistema <ArrowRight size={18} /></>
              )}
            </button>

                          <div className="text-center mt-4 pt-4 border-t border-slate-100 space-y-3">
                {(role === 'DRIVER' || role === 'CLIENT') && (
                  <p className="text-sm text-slate-500">
                    {isRegistering || isResetting ? 'Já tem uma conta e sabe a senha?' : 'Primeiro acesso?'}
                    <button
                      type="button"
                      onClick={() => { setIsRegistering(isRegistering || isResetting ? false : true); setIsResetting(false); setError(''); setPassword(''); }}
                      className="ml-1 font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                    >
                      {isRegistering || isResetting ? 'Fazer login' : 'Criar cadastro'}
                    </button>
                  </p>
                )}
                
                {role === 'ADMIN' && (isRegistering || isResetting) && (
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(false); setIsResetting(false); setError(''); setPassword(''); }}
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Fazer login
                  </button>
                )}

              </div>
            
            {role === 'ADMIN' && !isRegistering && (
              <div className="text-center mt-4">
                <p className="text-xs text-slate-400">
                  Acesso restrito à gestão da transportadora.
                </p>
              </div>
            )}

          </div>
        </form>
      </div>
    </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {role === 'CLIENT' ? 'Termos de Serviço - Portal do Cliente' : 'Termo de Autonomia e Rastreamento - Motorista'}
              </h2>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-500 hover:bg-slate-200 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700 space-y-4">
              {role === 'CLIENT' ? (
                <>
                  <p className="font-bold text-base text-slate-900 text-center uppercase border-b pb-2 mb-4">
                    Contrato de Prestação de Serviços de Transporte e Termos de Uso
                  </p>
                  <p><strong>1. DO OBJETO:</strong> O presente termo regula a utilização do sistema para cotação, emissão e gerenciamento de Ordens de Serviço (OS) de transportes, intermediadas pela plataforma.</p>
                  <p><strong>2. RESPONSABILIDADE FINANCEIRA:</strong> A CONTRATANTE (Cliente) declara assumir total responsabilidade pelo pagamento pontual dos valores acordados em cada Ordem de Serviço, seja em regime de faturamento ou pagamento à vista.</p>
                  <p><strong>3. VERACIDADE DOCUMENTAL:</strong> O signatário declara, sob as penas da lei (incluindo o crime de falsidade ideológica), que os documentos anexados (Cartão CNPJ, Comprovante de Endereço e Contrato Social/Procuração) são autênticos e que possui amplos poderes para representar a pessoa jurídica cadastrada.</p>
                  <p><strong>4. SIGILO E LGPD:</strong> A plataforma compromete-se a tratar os dados da CONTRATANTE conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), utilizando-os estritamente para a prestação dos serviços logísticos, faturamento e emissão de Notas Fiscais (NFS-e).</p>
                  <p><strong>5. ASSINATURA ELETRÔNICA:</strong> Nos termos da Medida Provisória nº 2.200-2/2001 e legislação vigente, o clique no botão "Aceito" no cadastro possui validade jurídica equivalente à assinatura de próprio punho, sendo o IP, timestamp e dados de conexão registrados em log de auditoria permanente no banco de dados.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-base text-slate-900 text-center uppercase border-b pb-2 mb-4">
                    Termo de Autonomia, Inexistência de Vínculo e Consentimento de Rastreamento
                  </p>
                  <p><strong>1. DA NATUREZA DA PRESTAÇÃO DO SERVIÇO:</strong> O CONTRATADO (Motorista Parceiro) declara expressamente que atuará na qualidade de Profissional Autônomo ou Microempreendedor Individual (MEI), não existindo qualquer vínculo empregatício com a plataforma, nos moldes dos artigos 2º e 3º da CLT, possuindo total liberdade de horários e autonomia para aceitar ou recusar Ordens de Serviço (OS).</p>
                  <p><strong>2. RESPONSABILIDADE CIVIL:</strong> O CONTRATADO assume responsabilidade civil sobre as mercadorias sob sua custódia durante as viagens, comprometendo-se a respeitar as leis de trânsito e conduzir a carga com zelo até o destino final acordado.</p>
                  <p><strong>3. RASTREAMENTO (LGPD):</strong> O CONTRATADO autoriza expressa e inequivocamente, para fins logísticos, de segurança da carga e comprovação de entrega (art. 7º, incisos II e V da LGPD), o <strong>rastreamento de sua localização (GPS) em tempo real</strong> pelo aplicativo durante a execução da OS. Os dados de localização não serão coletados após a finalização da viagem.</p>
                  <p><strong>4. DOCUMENTAÇÃO:</strong> O CONTRATADO declara que a CNH e os documentos do veículo anexados são regulares e autênticos. A irregularidade documental acarreta o bloqueio imediato do acesso à plataforma.</p>
                  <p><strong>5. ASSINATURA ELETRÔNICA:</strong> A validação deste termo via caixa de seleção ("checkbox") e envio dos dados de registro constitui assinatura eletrônica com validade jurídica (MP nº 2.200-2/2001), sendo armazenados o Endereço IP, Carimbo de Tempo (Timestamp) e Identificador do Dispositivo (Log de Auditoria).</p>
                </>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Eu li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

