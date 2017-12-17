# flightdeals-firebase
Toy project to test Firebase on Android plus some other libraries and tools.

# Structure of the project
/android: Android client app
/server: Firebase and Google Cloud code
/server/appengine: Small App Engine code to create a cron server. This server will send ticks to three pub/sub channels: minutes-tick, hourly-tick and daily-tick.
/server/functions: Google Cloud functions
/server/functions/common: Common code
/server/functions/firebase: Code interacting with the Firebase realtime database
/server/functions/parsers: Code that retrieves data from source sites
/server/functions/tests: Test code

