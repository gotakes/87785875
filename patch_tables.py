import re

with open('src/components/Admin.tsx', 'r') as f:
    content = f.read()

# Add Ações header for Driver table
content = re.sub(
    r'<th className="px-4 py-3 font-semibold text-center">Status Pgto</th>\s*</tr>',
    r'<th className="px-4 py-3 font-semibold text-center">Status Pgto</th>\n                      <th className="px-4 py-3 font-semibold text-center">Ações</th>\n                    </tr>',
    content
)

# Add Ações cell for Driver table
driver_actions = """
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => onEditOs(os)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Editar"><Edit size={16} /></button>
                            <button onClick={() => onDeleteOs(os.id!)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir Definitivamente"><Trash2 size={16} /></button>
                          </div>
                        </td>
"""
content = re.sub(
    r'<td className="px-4 py-3 text-center">\s*<span className={`px-2 py-1 text-\[10px\] font-bold uppercase rounded-full \$\{os\.paymentStatusDriver === \'PAID\' \? \'bg-emerald-100 text-emerald-800\' : \'bg-amber-100 text-amber-800\'\}`}>\s*\{os\.paymentStatusDriver === \'PAID\' \? \'Pago\' : \'Pendente\'\}\s*</span>\s*</td>\s*</tr>',
    r'<td className="px-4 py-3 text-center">\n                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${os.paymentStatusDriver === \'PAID\' ? \'bg-emerald-100 text-emerald-800\' : \'bg-amber-100 text-amber-800\'}`}>\n                            {os.paymentStatusDriver === \'PAID\' ? \'Pago\' : \'Pendente\'}\n                          </span>\n                        </td>\n' + driver_actions + '\n                      </tr>',
    content
)

# Add Ações header for Client table
content = re.sub(
    r'<th className="px-4 py-3 font-semibold text-center">Status</th>\s*</tr>',
    r'<th className="px-4 py-3 font-semibold text-center">Status</th>\n                      <th className="px-4 py-3 font-semibold text-center">Ações</th>\n                    </tr>',
    content
)

# Add Ações cell for Client table
client_actions = """
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => onEditOs(os)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Editar"><Edit size={16} /></button>
                            <button onClick={() => onDeleteOs(os.id!)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir Definitivamente"><Trash2 size={16} /></button>
                          </div>
                        </td>
"""
content = re.sub(
    r'<td className="px-4 py-3 text-center">\s*<span className={`px-2 py-1 text-\[10px\] font-bold uppercase rounded-full \$\{os\.paymentStatusClient === \'PAID\' \? \'bg-emerald-100 text-emerald-800\' : \'bg-amber-100 text-amber-800\'\}`}>\s*\{os\.paymentStatusClient === \'PAID\' \? \'Recebido\' : \'Pendente\'\}\s*</span>\s*</td>\s*</tr>',
    r'<td className="px-4 py-3 text-center">\n                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${os.paymentStatusClient === \'PAID\' ? \'bg-emerald-100 text-emerald-800\' : \'bg-amber-100 text-amber-800\'}`}>\n                            {os.paymentStatusClient === \'PAID\' ? \'Recebido\' : \'Pendente\'}\n                          </span>\n                        </td>\n' + client_actions + '\n                      </tr>',
    content
)


# Fix colSpan for both empty table states
content = re.sub(
    r'<td colSpan=\{6\}',
    r'<td colSpan={7}',
    content
)

with open('src/components/Admin.tsx', 'w') as f:
    f.write(content)
