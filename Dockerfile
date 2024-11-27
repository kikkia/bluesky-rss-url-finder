FROM pmmmwh/puppeteer:16.14.2

USER root
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 7788
ENTRYPOINT ["node", "index.js"]