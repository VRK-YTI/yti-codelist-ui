# Node base image, in case version needed syntax is node:<version>
FROM node

RUN mkdir -p /app

WORKDIR /app

COPY package.json /app/

RUN ["npm", "install"]

COPY . /app

# Application port
EXPOSE 9700

# Start wizardry
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "500"]
