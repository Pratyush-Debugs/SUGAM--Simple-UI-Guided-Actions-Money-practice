#!/usr/bin/env python3
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ext_dir = os.path.join(ROOT, 'SUGAM', 'extension')

targets = [
    os.path.join(ROOT, 'sugam-extension.zip'),
    os.path.join(ROOT, 'assets', 'sugam-extension.zip')
]

for zip_path in targets:
    os.makedirs(os.path.dirname(zip_path), exist_ok=True)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(ext_dir):
            if 'tests' in root.split(os.sep) or 'node_modules' in root.split(os.sep):
                continue
            for f in files:
                full = os.path.join(root, f)
                rel = os.path.relpath(full, ext_dir)
                z.write(full, rel)
    print(f'Packaged {zip_path} ({os.path.getsize(zip_path)} bytes)')

