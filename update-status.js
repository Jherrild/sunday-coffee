#!/usr/bin/env node

/**
 * Script to update the Sunday Coffee status page
 * Usage: node update-status.js <true|false>
 * 
 * This script:
 * 1. Calculates the coffee Sunday in Pacific time (Sunday cutoff: 9:30 AM)
 * 2. Updates index.html with the coffee status and dates
 * 3. Commits and pushes changes to a new branch
 * 4. Creates a pull request and merges it to main
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getCoffeeDates } = require('./coffee-dates');

// Get command line argument
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node update-status.js <true|false>');
  process.exit(1);
}

const coffeeStatus = args[0].toLowerCase() === 'true';
console.log(`Updating coffee status to: ${coffeeStatus ? 'ON' : 'OFF'}`);

/**
 * Update index.html with new status and dates
 */
function updateIndexHtml(nextSunday, lastUpdated, status) {
  const indexPath = path.join(__dirname, 'index.html');
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Update body class (status-on or status-off)
  const statusClass = status ? 'status-on' : 'status-off';
  content = content.replace(
    /<body class="status-(on|off)">/,
    `<body class="${statusClass}">`
  );
  
  // Update the date line
  content = content.replace(
    /<div class="date">.*?<\/div>/,
    `<div class="date">${nextSunday}</div>`
  );
  
  // Update last updated footer
  content = content.replace(
    /<strong>Last updated:<\/strong>\s+[A-Za-z]+\s+\d+,\s+\d+/,
    `<strong>Last updated:</strong> ${lastUpdated}`
  );
  
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✓ Updated index.html');
}

/**
 * Execute git command
 */
function gitExec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    console.error(`Git command failed: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Main execution
 */
function main() {
  const { nextSunday, branchDate: branchName, lastUpdated } = getCoffeeDates(new Date());
  
  console.log(`Next Sunday: ${nextSunday}`);
  console.log(`Branch name: ${branchName}`);
  
  // Update the HTML file
  updateIndexHtml(nextSunday, lastUpdated, coffeeStatus);
  
  // Git operations
  try {
    // Configure git if needed (for CI environments)
    try {
      // Check if user.email is configured, if not set it
      const emailCheck = gitExec('git config user.email').trim();
      if (!emailCheck) {
        gitExec('git config user.email "github-actions[bot]@users.noreply.github.com"');
      }
    } catch (e) {
      // If git config fails (not set), configure it
      gitExec('git config user.email "github-actions[bot]@users.noreply.github.com"');
    }
    
    try {
      // Check if user.name is configured, if not set it
      const nameCheck = gitExec('git config user.name').trim();
      if (!nameCheck) {
        gitExec('git config user.name "GitHub Actions"');
      }
    } catch (e) {
      // If git config fails (not set), configure it
      gitExec('git config user.name "GitHub Actions"');
    }
    
    // Ensure we're on main branch and up to date
    console.log('Fetching latest changes...');
    gitExec('git fetch origin main');
    gitExec('git checkout main');
    gitExec('git reset --hard origin/main');
    
    // Create and checkout new branch
    console.log(`Creating branch: ${branchName}`);
    gitExec(`git checkout -b ${branchName}`);
    
    // Stage and commit changes
    console.log('Committing changes...');
    gitExec('git add index.html');
    const commitMessage = `Update coffee status for ${nextSunday}`;
    gitExec(`git commit -m "${commitMessage}"`);
    
    // Push branch
    console.log('Pushing branch...');
    gitExec(`git push -u origin ${branchName}`);
    
    console.log('✓ Changes pushed successfully');
    console.log('');
    console.log('Next steps:');
    console.log('- A pull request needs to be created and merged');
    console.log('- Use GitHub CLI or API to create and merge the PR');
    console.log(`- Branch: ${branchName}`);
    
  } catch (error) {
    console.error('Error during git operations:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
