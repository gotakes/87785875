import re

with open('src/components/Admin.tsx', 'r') as f:
    content = f.read()

# Add Edit and Delete buttons next to print and share in OS_LIST
new_buttons = """
                            <button
                              onClick={() => setEditingOs(os)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Editar OS"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteOs(os.id!)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir Definitivamente"
                            >
                              <Trash2 size={18} />
                            </button>
"""

content = re.sub(
    r'(<button\s*onClick=\{\(\) => sendOsWhatsApp\(os\)\}\s*className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"\s*title="Compartilhar"\s*>\s*<MessageCircle size=\{18\} />\s*</button>)',
    r'\1\n' + new_buttons,
    content
)

# And fix the 'ColSpan' in OS_LIST empty state from 7 to 8 maybe? No, let's check OS_LIST header count
content = re.sub(
    r'<td colSpan=\{7\}\s*className="px-6 py-12 text-center text-slate-500">',
    r'<td colSpan={7} className="px-6 py-12 text-center text-slate-500">',
    content
) # Actually, the header didn't change count, we just added buttons inside the last column (Ações)

with open('src/components/Admin.tsx', 'w') as f:
    f.write(content)
