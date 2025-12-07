#!/usr/bin/env node

/**
 * Script to update the Sunday Coffee status page
 * Usage: node update-status.js <true|false>
 * 
 * This script:
 * 1. Calculates the next Sunday date (always at least 1 day in the future)
 * 2. Updates index.html with the coffee status and dates
 * 3. Commits and pushes changes to a new branch
 * 4. Creates a pull request and merges it to main
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get command line argument
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node update-status.js <true|false>');
  process.exit(1);
}

const coffeeStatus = args[0].toLowerCase() === 'true';
console.log(`Updating coffee status to: ${coffeeStatus ? 'ON' : 'OFF'}`);

/**
 * Calculate the next Sunday date
 * If today is Sunday, return next Sunday (7 days from now)
 * Otherwise, return the upcoming Sunday
 * 
 * Note: Uses local timezone. The calculation is based on the system's
 * local time, so results may vary if run in different timezones.
 */
function getNextSunday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate days until next Sunday
  // If today is Sunday (0), we want next Sunday (7 days)
  // Otherwise, calculate days remaining in the week
  const daysUntilSunday = dayOfWeek === 0 ? 7 : (7 - dayOfWeek);
  
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  
  return nextSunday;
}

/**
 * Format date as "Sunday, Month Day, Year"
 */
function formatSundayDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format date as "Month Day, Year" for last updated
 */
function formatLastUpdated(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format date as YYYY-MM-DD for branch name
 */
function formatDateForBranch(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  const sundayDateStr = formatSundayDate(nextSunday);
  content = content.replace(
    /<div class="date">.*?<\/div>/,
    `<div class="date">${sundayDateStr}</div>`
  );
  
  // Update last updated footer
  const lastUpdatedStr = formatLastUpdated(lastUpdated);
  content = content.replace(
    /<strong>Last updated:<\/strong>\s+[A-Za-z]+\s+\d+,\s+\d+/,
    `<strong>Last updated:</strong> ${lastUpdatedStr}`
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
  const nextSunday = getNextSunday();
  const today = new Date();
  const branchName = formatDateForBranch(nextSunday);
  
  console.log(`Next Sunday: ${formatSundayDate(nextSunday)}`);
  console.log(`Branch name: ${branchName}`);
  
  // Update the HTML file
  updateIndexHtml(nextSunday, today, coffeeStatus);
  
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
    const commitMessage = `Update coffee status for ${formatSundayDate(nextSunday)}`;
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
