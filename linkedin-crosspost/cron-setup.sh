#!/bin/bash

# LinkedIn Cross-Poster Cron Setup Script
# This script sets up automatic checking for new Amp articles every 4 hours

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
LOG_FILE="$SCRIPT_DIR/crosspost.log"

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Add cron job to check every 4 hours
CRON_JOB="0 */4 * * * cd $SCRIPT_DIR && /usr/local/bin/node server-runner.js >> $LOG_FILE 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "server-runner.js"; then
    echo "Cron job already exists"
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job added: Check for new articles every 4 hours"
fi

echo "📝 Cron job: $CRON_JOB"
echo "📋 Log file: $LOG_FILE"
echo "🔧 To view logs: tail -f $LOG_FILE"
echo "🗑️  To remove cron job: crontab -l | grep -v server-runner.js | crontab -"

# Test run
echo "🧪 Running test check..."
cd "$SCRIPT_DIR"
node server-runner.js
