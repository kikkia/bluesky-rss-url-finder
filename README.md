# Bluesky rss url finder
A simple service to get you a blue sky users rss feed url. 

Uses puppeteer to do lookup their feed url, useful for looking it up when you dont have js enabled.

Exposes an http get endpoint /user/{handle} that just returns their rss url in json format. 

### Running
You can just `docker-compose build`, then `docker-compose up`