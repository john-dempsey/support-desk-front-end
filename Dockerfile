# Stage 6: builds the front-end and serves it with nginx, as a real
# deployment would. `npm run dev` stays how you work day to day; this is
# "what running it for real looks like", like the back-end's Dockerfile.
#
# Two stages. The first needs Node to run `npm run build`. The second only
# serves the files that build made, so the image that runs has nginx and
# dist/ in it: no Node, no node_modules and no source code.

# ---- build: turn src/ into dist/ ----------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# package files first, so Docker can reuse the `npm ci` layer when only
# the code has changed.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_* values are written into the JavaScript when it's built, not read
# when the app runs. So the API's URL must be known now. .env isn't copied
# into the image (see .dockerignore), so compose.yaml passes it in as a
# build argument instead, and RUN sees it as an environment variable. If
# it's empty, client.js falls back to its default, as in `npm run dev`.
ARG VITE_API_URL
RUN npm run build

# ---- serve: nginx and the built files, nothing else ----------------------
FROM nginx:1.30-alpine

# Our settings replace nginx's default site (see nginx.conf for why).
COPY nginx.conf /etc/nginx/conf.d/default.conf
# The only thing taken from the build stage.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
# No CMD: the nginx image already starts nginx.
