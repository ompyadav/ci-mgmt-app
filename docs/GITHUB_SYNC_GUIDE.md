# GitHub Sync Guide - Keep Your Code in Sync

## Overview
This guide explains how to ensure all code changes made through Bob IDE are properly synced with GitHub.

---

## Initial Setup (One-Time)

### 1. Check if Git is Initialized
```bash
git status
```

If you see "not a git repository", initialize it:
```bash
git init
```

### 2. Create GitHub Repository

1. Go to https://github.com
2. Click "New Repository" (+ icon, top right)
3. Repository name: `ci-mgmt-app`
4. Description: "Continuous Improvement Management System"
5. Choose: **Private** (recommended) or Public
6. **DO NOT** check "Initialize with README"
7. Click "Create repository"

### 3. Connect Local Repository to GitHub

```bash
# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ci-mgmt-app.git

# Verify remote is added
git remote -v
```

### 4. Initial Push

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete CI Management Application with Neon DB"

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Daily Workflow - Syncing Changes

### Method 1: Quick Sync (Recommended for Daily Use)

**After making changes in Bob IDE:**

```bash
# Check what files changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Add bulk delete feature and reorganize navigation"

# Push to GitHub
git push origin main
```

### Method 2: Selective Sync (For Specific Files)

```bash
# Add specific files only
git add backend/src/main/java/com/cims/app/service/IdeaBulkImportService.java
git add frontend/src/pages/data-management/DataManagement.tsx

# Commit
git commit -m "Add bulk delete functionality"

# Push
git push origin main
```

### Method 3: Automated Sync Script

Create `sync-to-github.bat` in your project root:

```batch
@echo off
echo ========================================
echo Syncing Code to GitHub
echo ========================================
echo.

REM Check for changes
git status

echo.
set /p commit_msg="Enter commit message: "

REM Add all changes
git add .

REM Commit
git commit -m "%commit_msg%"

REM Push to GitHub
git push origin main

echo.
echo ========================================
echo Sync Complete!
echo ========================================
pause
```

**Usage:**
```bash
sync-to-github.bat
```

---

## Checking Sync Status

### 1. Check Local Changes
```bash
# See what files are modified
git status

# See specific changes in files
git diff

# See commit history
git log --oneline -10
```

### 2. Check if Local is in Sync with GitHub
```bash
# Fetch latest from GitHub (doesn't change local files)
git fetch origin

# Compare local with remote
git status
```

You'll see one of these messages:
- `Your branch is up to date` - ✅ In sync
- `Your branch is ahead by X commits` - ⚠️ Need to push
- `Your branch is behind by X commits` - ⚠️ Need to pull

### 3. View on GitHub
1. Go to https://github.com/YOUR_USERNAME/ci-mgmt-app
2. Check the latest commit date and message
3. Browse files to verify they match your local version

---

## Common Scenarios

### Scenario 1: Made Changes, Need to Push

```bash
# See what changed
git status

# Add all changes
git add .

# Commit
git commit -m "Update navigation menu structure"

# Push to GitHub
git push origin main
```

### Scenario 2: Forgot to Push Yesterday's Changes

```bash
# Check if you have unpushed commits
git log origin/main..HEAD

# If you see commits, push them
git push origin main
```

### Scenario 3: Working on Multiple Features

```bash
# Create feature branch
git checkout -b feature/reports-enhancement

# Make changes...
git add .
git commit -m "Add advanced filtering to reports"

# Push feature branch
git push origin feature/reports-enhancement

# Later, merge to main
git checkout main
git merge feature/reports-enhancement
git push origin main
```

### Scenario 4: Need to Pull Changes (if working from multiple machines)

```bash
# Pull latest changes from GitHub
git pull origin main

# If conflicts occur, resolve them manually
# Then:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

---

## Best Practices

### 1. Commit Frequently
```bash
# Good practice: Commit after completing a feature
git add .
git commit -m "Add bulk delete functionality"
git push origin main
```

### 2. Write Meaningful Commit Messages

**Good commit messages:**
```bash
git commit -m "Add bulk delete endpoint for ideas"
git commit -m "Fix: Resolve navigation menu role checking issue"
git commit -m "Update: Migrate from Docker to Neon database"
git commit -m "Docs: Add GitHub sync guide"
```

**Bad commit messages:**
```bash
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

### 3. Push at End of Day
```bash
# Before closing Bob IDE for the day
git add .
git commit -m "End of day commit: [describe what you worked on]"
git push origin main
```

### 4. Check Status Before Starting Work
```bash
# Start of day
git status
git pull origin main
```

---

## Automation Options

### Option 1: VS Code Git Integration

Bob IDE (VS Code) has built-in Git support:

1. **View Changes:**
   - Click Source Control icon (left sidebar)
   - See all modified files

2. **Commit:**
   - Stage files (click + icon)
   - Enter commit message
   - Click ✓ (checkmark) to commit

3. **Push:**
   - Click "..." menu
   - Select "Push"

### Option 2: Git Auto-Commit (Advanced)

Create `.git/hooks/post-commit`:
```bash
#!/bin/sh
git push origin main
```

This automatically pushes after every commit.

---

## Verification Checklist

After making changes in Bob IDE, verify sync:

- [ ] Run `git status` - should show "nothing to commit, working tree clean"
- [ ] Run `git log -1` - should show your latest commit
- [ ] Visit GitHub repository - should see latest commit
- [ ] Check file timestamps on GitHub - should be recent
- [ ] Browse a changed file on GitHub - should show your changes

---

## Quick Reference Commands

```bash
# Daily workflow
git status                    # Check what changed
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin main          # Push to GitHub

# Check sync status
git fetch origin              # Get latest from GitHub
git status                    # Compare local vs remote
git log origin/main..HEAD     # See unpushed commits

# View history
git log --oneline -10         # Last 10 commits
git log --graph --oneline     # Visual commit history

# Undo changes (before commit)
git checkout -- filename      # Discard changes in file
git reset HEAD filename       # Unstage file

# View changes
git diff                      # See all changes
git diff filename             # See changes in specific file
```

---

## Troubleshooting

### Problem: "Permission denied (publickey)"

**Solution:** Use HTTPS instead of SSH
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/ci-mgmt-app.git
```

### Problem: "Failed to push some refs"

**Solution:** Pull first, then push
```bash
git pull origin main --rebase
git push origin main
```

### Problem: "Merge conflict"

**Solution:**
1. Open conflicted files
2. Look for conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Their changes
   >>>>>>> branch-name
   ```
3. Edit to keep desired code
4. Remove conflict markers
5. Save file
6. Run:
   ```bash
   git add .
   git commit -m "Resolve merge conflicts"
   git push origin main
   ```

### Problem: Forgot to commit before closing Bob IDE

**Solution:**
```bash
# Next time you open Bob IDE
git status                    # See what wasn't committed
git add .
git commit -m "Previous session changes"
git push origin main
```

---

## Recommended Workflow

### Morning Routine:
```bash
cd c:/Bob/workspace/ci-mgmt-app
git status
git pull origin main
```

### After Each Feature:
```bash
git add .
git commit -m "Descriptive message about what you did"
git push origin main
```

### End of Day:
```bash
git status                    # Check for uncommitted changes
git add .
git commit -m "End of day: [summary of work]"
git push origin main
```

### Weekly:
```bash
# Create a tag for weekly milestones
git tag -a v1.1.0 -m "Week 1 milestone"
git push origin v1.1.0
```

---

## GitHub Desktop (Alternative)

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com
2. Clone your repository
3. Make changes in Bob IDE
4. GitHub Desktop automatically detects changes
5. Write commit message
6. Click "Commit to main"
7. Click "Push origin"

---

## Summary

**To ensure Bob IDE changes are synced with GitHub:**

1. ✅ Make changes in Bob IDE
2. ✅ Run `git add .`
3. ✅ Run `git commit -m "Your message"`
4. ✅ Run `git push origin main`
5. ✅ Verify on GitHub website

**That's it! Your code is now safely backed up on GitHub.**

---

**Made with Bob IDE**