#!/usr/bin/env python3
import os
import sys
import time
import subprocess

WATCH_EXTENSIONS = ('.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.webp')
DEBOUNCE_SECONDS = 2.0
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_file_mtimes(directory):
    mtimes = {}
    for root, dirs, files in os.walk(directory):
        # Ignore hidden directories like .git
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith(WATCH_EXTENSIONS) and not file.startswith('.'):
                full_path = os.path.join(root, file)
                try:
                    mtimes[full_path] = os.path.getmtime(full_path)
                except OSError:
                    pass
    return mtimes

def sync_to_github():
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n[🔄 {timestamp}] Change detected in Smarika Pokhrel Portfolio! Syncing with GitHub...")
    try:
        # Check if git repo exists
        if not os.path.exists(os.path.join(PROJECT_DIR, '.git')):
            print("⚠️ Error: Git repository not initialized yet. Run 'git init' and connect to GitHub first.")
            return

        # Check git status
        status = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True, cwd=PROJECT_DIR)
        if not status.stdout.strip():
            print("ℹ️ No uncommitted changes found.")
            return

        # Add, commit, push
        subprocess.run(['git', 'add', '.'], check=True, cwd=PROJECT_DIR)
        commit_msg = f"Auto update: {timestamp}"
        subprocess.run(['git', 'commit', '-m', commit_msg], check=True, cwd=PROJECT_DIR)
        
        # Push to main branch
        result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True, cwd=PROJECT_DIR)
        if result.returncode == 0:
            print(f"✅ Successfully updated Smarika Pokhrel GitHub repository! Deployment will trigger automatically.")
        else:
            # Fallback if branch is master instead of main
            subprocess.run(['git', 'push', 'origin', 'master'], check=True, cwd=PROJECT_DIR)
            print(f"✅ Successfully updated Smarika Pokhrel GitHub repository! Deployment will trigger automatically.")
    except Exception as e:
        print(f"❌ Auto-sync error: {e}")

def main():
    print("=" * 65)
    print("🚀 Smarika Pokhrel Portfolio Auto-Sync Watcher Started!")
    print(f"📁 Watching directory: {PROJECT_DIR}")
    print(f"📄 Watching extensions: {', '.join(WATCH_EXTENSIONS)}")
    print("💡 Any file save will automatically git commit and push to GitHub.")
    print("=" * 65)

    last_mtimes = get_file_mtimes(PROJECT_DIR)
    
    try:
        while True:
            time.sleep(1)
            current_mtimes = get_file_mtimes(PROJECT_DIR)
            
            changed = False
            for filepath, mtime in current_mtimes.items():
                if filepath not in last_mtimes or mtime > last_mtimes[filepath]:
                    print(f"\n📝 File modified: {os.path.basename(filepath)}")
                    changed = True
                    break
            
            if changed:
                time.sleep(DEBOUNCE_SECONDS) # Wait for all edits/saves to finish
                last_mtimes = get_file_mtimes(PROJECT_DIR) # refresh state
                sync_to_github()
    except KeyboardInterrupt:
        print("\n👋 Auto-sync watcher stopped.")

if __name__ == '__main__':
    main()
