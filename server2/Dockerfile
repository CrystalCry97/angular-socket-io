FROM node:11.1.0-alpine

WORKDIR /home/node
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]