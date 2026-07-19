import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    replacements = [
        (r'\bp-6\b', 'p-4 md:p-6'),
        (r'\bp-8\b', 'p-4 md:p-8'),
        (r'\bpx-6\b', 'px-4 md:px-6'),
        (r'\bpy-6\b', 'py-4 md:py-6'),
        (r'\bgap-6\b', 'gap-4 md:gap-6'),
        (r'\bgap-8\b', 'gap-4 md:gap-8'),
        (r'\btext-2xl\b', 'text-xl md:text-2xl'),
        (r'\bmb-6\b', 'mb-4 md:mb-6'),
        (r'\bmb-8\b', 'mb-4 md:mb-8'),
        (r'\bmt-6\b', 'mt-4 md:mt-6'),
        (r'\bmt-8\b', 'mt-4 md:mt-8'),
        (r'\brounded-2xl\b', 'rounded-xl md:rounded-2xl'),
        # Avoid doubling up if they already have md: prefix
        (r'md:p-4 md:p-6', 'md:p-6'),
        (r'md:p-4 md:p-8', 'md:p-8'),
        (r'md:px-4 md:px-6', 'md:px-6'),
        (r'md:py-4 md:py-6', 'md:py-6'),
        (r'md:gap-4 md:gap-6', 'md:gap-6'),
        (r'md:gap-4 md:gap-8', 'md:gap-8'),
        (r'md:text-xl md:text-2xl', 'md:text-2xl'),
        (r'md:mb-4 md:mb-6', 'md:mb-6'),
        (r'md:mb-4 md:mb-8', 'md:mb-8'),
        (r'md:mt-4 md:mt-6', 'md:mt-6'),
        (r'md:mt-4 md:mt-8', 'md:mt-8'),
        (r'md:rounded-xl md:rounded-2xl', 'md:rounded-2xl'),
        
        # specific table adjustments for mobile
        (r'\bpx-4 py-3 text-left\b', 'px-3 py-2 md:px-4 md:py-3 text-left text-sm md:text-base'),
        (r'\bpx-4 py-3\b', 'px-3 py-2 md:px-4 md:py-3'),
        (r'\bpx-4 py-4\b', 'px-3 py-3 md:px-4 md:py-4'),
        (r'md:px-3 md:py-2 md:px-4 md:py-3', 'md:px-4 md:py-3'),
        (r'md:px-3 md:py-3 md:px-4 md:py-4', 'md:px-4 md:py-4'),
    ]

    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

