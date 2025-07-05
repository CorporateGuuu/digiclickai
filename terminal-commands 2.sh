# Initialize git repository (if not already done)
git init

# Add all files to staging
git add .

# Commit the changes
git commit -m "Initial commit for Digiclick Website"

# Add the remote repository
# Replace with your actual repository URL
git remote add origin https://github.com/CorporateGuuu/digiclick-website.git

# Push to the main branch
# If the repository is new, use:
git push -u origin main

# If you're pushing to an existing repository and main branch already exists:
# git push -u origin main
