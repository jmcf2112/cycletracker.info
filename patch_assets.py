import os

def patch_file(file_path, search_str, replace_str):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if search_str in content:
        new_content = content.replace(search_str, replace_str)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched {file_path}: '{search_str}' -> '{replace_str}'")
    else:
        print(f"Search string '{search_str}' not found in {file_path}")

# Patch Small Tip to Medium in the main index bundle (where translations seem to be)
patch_file('public/assets-donate/index-CYenZCOw.js', 'Small Tip', 'Medium')

# Patch placeholder:"10" to placeholder:"1" in the Donate chunk
patch_file('public/assets-donate/Donate-CSikK-Om.js', 'placeholder:"10"', 'placeholder:"1"')
