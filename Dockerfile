#
# BUILD STAGE
#

# alpine version should match the version in .nvmrc as closely as possible
FROM node:16.13.1-alpine3.14@sha256:a9b9cb880fa429b0bea899cd3b1bc081ab7277cc97e6d2dcd84bd9753b2027e1 as builder

# version generated by CI, injected into the application
ARG VERSION

# optionally provide .npmrc contents to use different npm repository
ARG NPMRC

# set VERBOSE=true to add verbose flags to package installation
# this can be used for checking that the packages are downloaded from the
# correct registry
ARG VERBOSE

# checkout a specific commit id of yti-common-ui project
ARG COMMON_UI_COMMIT_ID=2ff813cdce4c2e913cb6226192f3757d2599a76b

RUN \
      # Install tooling
      apk add --update git && \
      apk add openssl curl ca-certificates yarn && \
      # yarn 1.x needs lockfiles to be modified to use a custom registry
      # yarn 2.x should work with --registry
      npm install -g lock-treatment-tool@0.4.1

RUN   mkdir -p /usr/src/yti-codelist-ui && \
      echo -n "$NPMRC" > /tmp/_npmrc

# build yti-common-ui
WORKDIR /usr/src
RUN \
      git clone https://github.com/VRK-YTI/yti-common-ui && \
      cd yti-common-ui && \
      git -c advice.detachedHead=false checkout $COMMON_UI_COMMIT_ID && \
      if [ -s "/tmp/_npmrc" ]; then cp /tmp/_npmrc .npmrc; fi && \
      npm `test "$VERBOSE" = "true" && echo "--loglevel verbose"` install && \
      npm run build:prod && \
      cd ..

# build yti-codelist-ui
WORKDIR /usr/src/yti-codelist-ui/
COPY . .
RUN \
      echo "$VERSION" > src/version.txt && \
      sed -i 's#"@vrk-yti/yti-common-ui": "[^"]*"#"\@vrk-yti/yti-common-ui": "file://usr/src/yti-common-ui/dist/yti-common-ui/"#' package.json && \
      if [ -s "/tmp/_npmrc" ]; then cp /tmp/_npmrc .npmrc; fi && \
      locktt --registry="`npm get registry`" && \
      yarn `test "$VERBOSE" = "true" && echo "--verbose"` install && \
      yarn run build --output-hashing=all

#
# INSTALL STAGE
#

FROM node:16.13.1-alpine3.14@sha256:a9b9cb880fa429b0bea899cd3b1bc081ab7277cc97e6d2dcd84bd9753b2027e1

RUN \
      apk add openssl curl ca-certificates && \
      apk add --update nginx && \
      rm -rf /var/cache/apk/*

RUN \
      # Install nginx repo
      printf "%s%s%s\n" "http://nginx.org/packages/alpine/v" `egrep -o '^[0-9]+\.[0-9]+' /etc/alpine-release` "/main" | tee -a /etc/apk/repositories && \
      # Install nginx key
      curl -o /tmp/nginx_signing.rsa.pub https://nginx.org/keys/nginx_signing.rsa.pub && \
      # Check key
      openssl rsa -pubin -in /tmp/nginx_signing.rsa.pub -text -noout && \
      # Move key to storage
      mv /tmp/nginx_signing.rsa.pub /etc/apk/keys/ && \
      mkdir -p /run/nginx && \
      # Stream the nginx logs to stdout and stderr
      ln -sf /dev/stdout /var/log/nginx/access.log && \
      ln -sf /dev/stderr /var/log/nginx/error.log

# Add nginx config
ADD nginx.conf /etc/nginx/nginx.conf

WORKDIR /app

COPY --from=builder /usr/src/yti-codelist-ui/dist/ ./dist/

# Start web server and expose http
EXPOSE 80
CMD ["nginx"]
