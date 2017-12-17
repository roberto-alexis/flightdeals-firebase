/appengine: Contains a small app containing CRON jobs. These jobs trigger a pub/sub event every minute, hour and day. These are used to schedule regular work, such as the scraping of web-sites
/functions: Contains Firebase functions that react to either user events (i.e.: searching, logging, etc.) or to time (through the above cron job).

