FROM alpine:3.5

# Enables customized options using environment variables
ENV OSRM_BACKEND='http://maps.etecar.ru/osrm'
ENV OSRM_CENTER='45.0454463,38.9709704'
ENV OSRM_ZOOM='13'
ENV OSRM_LANGUAGE='ru'
ENV OSRM_LABEL='Карта'

# Copy package.json
RUN mkdir -p /src
COPY package.json /src

# Install app dependencies
RUN apk add --no-cache sed nodejs && \
    cd /src && \
    npm install

# Create app directory
COPY . /src
WORKDIR /src

# Run App
EXPOSE 9966
CMD ["npm", "start"]
