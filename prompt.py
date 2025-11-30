import os
import pyperclip
import sys

def get_project_files_content(scan_directory, project_root):
    """
    Walks through the specified scan_directory, reads relevant files,
    and returns their content as a single string.
    Paths in the prompt will be relative to the project_root.
    """
    
    # --- Configuration ---
    # Add or remove extensions as needed
    INCLUDE_EXTENSIONS = {
        # Frontend
        '.ts', '.html', '.css', '.scss', '.json', '.md', '.js',
        # Backend
        '.java', '.properties', '.yml', '.yaml', '.xml'
    }
    
    # Directories to completely skip
    IGNORE_DIRS = {
        'node_modules', '.git', 'dist', '.angular', 'cache', '.vscode', 
        '__pycache__', 'cypress'
    }
    
    # Specific files to skip
    IGNORE_FILES = {
        'package-lock.json', 
        'angular.json', 
        'tsconfig.app.json', 
        'tsconfig.json', 
        'tsconfig.spec.json', 
        '.gitignore'
        # We skip config files as they are often large and less
        # relevant for a prompt about the *application logic*.
        # You can comment out lines above to include them.
    }
    # ---------------------

    prompt_parts = []
    
    # Ensure the path is absolute and normalized
    scan_directory = os.path.abspath(scan_directory)
    project_root = os.path.abspath(project_root)
    
    if not os.path.isdir(scan_directory):
        print(f"Error: Path '{scan_directory}' is not a valid directory.")
        return None

    print(f"Scanning directory: {scan_directory}...\n")
    
    for root, dirs, files in os.walk(scan_directory, topdown=True):
        # --- Directory Pruning ---
        # This is the efficient way to skip directories with os.walk
        # We modify 'dirs' in place to prevent os.walk from descending
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for filename in files:
            # Check if file should be ignored
            if filename in IGNORE_FILES:
                continue
                
            # Check if the file extension is one we care about
            file_ext = os.path.splitext(filename)[1]
            if file_ext not in INCLUDE_EXTENSIONS:
                continue
                
            file_path = os.path.join(root, filename)
            
            # Get a relative path to make the prompt cleaner
            relative_path = os.path.relpath(file_path, project_root)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Add a header to separate files in the prompt
                    prompt_parts.append(f"--- START FILE: {relative_path.replace(os.sep, '/')} ---")
                    prompt_parts.append(content)
                    prompt_parts.append(f"--- END FILE: {relative_path.replace(os.sep, '/')} ---\n")
                    
                    print(f"Added: {relative_path}")
                    
            except UnicodeDecodeError:
                print(f"Skipped (encoding error): {relative_path}")
            except Exception as e:
                print(f"Skipped (error reading {relative_path}): {e}")

    # Join all the parts into one big string
    return "\n".join(prompt_parts)

def main():
    try:
        # Get the project directory from the current working directory
        project_dir = os.getcwd()
        scan_dir = os.path.join(project_dir, 'src')
        
        print(f"Project root assumed to be: {project_dir}")
        
        if not os.path.isdir(scan_dir):
            print(f"\nError: 'src' folder not found in the current directory.")
            print(f"Please run this script from your Angular project's root folder.")
            print(f"(Looked for: {scan_dir})")
            sys.exit(1)
            
        full_prompt = get_project_files_content(scan_dir, project_dir)
        
        if full_prompt:
            try:
                pyperclip.copy(full_prompt)
                print("\n---------------------------------------------------")
                print("SUCCESS!")
                print("Project content has been compiled and copied to your clipboard.")
                print(f"Total size: {len(full_prompt)} characters")
                print("---------------------------------------------------")
            except pyperclip.PyperclipException as e:
                print(f"\n--- ERROR: Could not copy to clipboard ---")
                print(f"Pyperclip error: {e}")
                print("The prompt has been printed below instead:\n")
                print(full_prompt)
        else:
            print("\nNo files were added to the prompt. Check your path and configuration.")

    except ImportError:
        print("\nError: The 'pyperclip' library is required.")
        print("Please install it by running: pip install pyperclip")
        print("After installing, run this script again.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
        sys.exit(0)

if __name__ == "__main__":
    main()