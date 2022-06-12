# Installation 

Install Node.js - [link](https://nodejs.org/en/).

# Download

Download the most recent release from releases - [link](https://github.com/kosciolek/tokens-notifier/releases).
# Usage

From the command line:

```
# Check every 3600 seconds (every hour), without notifications
node token-notifier.js --interval 3600 --notification silent
```

```
# Check every 1800 seconds (every half an hour), send notifications to telegram (not implemented yet)
node token-notifier.js --interval 3600 --notification telegram
```
