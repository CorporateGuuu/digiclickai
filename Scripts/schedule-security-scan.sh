#!/bin/bash

# This script sets up a monthly cron job to run the fix-security.sh script for automated security testing

CRON_JOB="0 0 1 * * cd $(pwd) && ./Scripts/fix-security.sh >> ./logs/security-scan.log 2>&1"

# Check if the cron job already exists
(crontab -l | grep -F "$CRON_JOB") && echo "Cron job already exists." && exit 0

# Add the cron job
(crontab -l; echo "$CRON_JOB") | crontab -

echo "Monthly security scan cron job added."
