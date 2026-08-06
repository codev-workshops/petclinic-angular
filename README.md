# Spring Petclinic React

## React frontend for Spring Petclinic

This repository contains the React frontend for the Spring Petclinic REST
application. It uses Vite, TypeScript, React Router's data router, React Hook
Form, axios, and Bootstrap 3.

The frontend is client-only. Start the
[spring-petclinic-rest](https://github.com/spring-petclinic/spring-petclinic-rest)
backend separately when you need real data. The default API is
`http://localhost:9966/petclinic/api/`.

## Installation

```bash
npm install
```

## Development

Start the Vite development server:

```bash
npm start
```

Open [http://localhost:4200/petclinic/](http://localhost:4200/petclinic/).
The application is built with `/petclinic/` as its base path.

Available commands:

```bash
npm run build       # build to dist-react/
npm run preview     # preview the production build
npm test            # run unit tests
npm run lint        # lint React and TypeScript sources
npm run format      # format React sources
npm run test:e2e    # run the Playwright suite
npm run test:e2e:ui # open Playwright UI mode
```

The Playwright suite provides a mocked API for browser tests. Real application
data still requires the backend REST API.

## Docker

Build and run the included nginx image:

```bash
docker build -t spring-petclinic-react:latest .
docker run --rm -p 8080:8080 spring-petclinic-react:latest
```

The image serves the Vite output from `/petclinic/`, so open
`http://localhost:8080/petclinic/`.

## Deploy on web servers

### Nginx

1. Build the React application:

   ```bash
   npm run build
   ```

2. Copy the contents of `dist-react/` to the server's
   `/usr/share/nginx/html/petclinic/` directory.

3. Configure nginx to serve the SPA fallback:

   ```nginx
   server {
       listen 80 default_server;
       root /usr/share/nginx/html;
       index index.html;

       location /petclinic/ {
           try_files $uri $uri/ /petclinic/index.html;
       }
   }
   ```

4. Reload nginx and open `http://server_name/petclinic/`.

### Apache

1. Build the React application with `npm run build`.
2. Copy the contents of `dist-react/` to `/var/www/html/petclinic/`.
3. Enable `AllowOverride All` for `/var/www/html`.
4. Create `/var/www/html/petclinic/.htaccess`:

   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} -f [OR]
   RewriteCond %{REQUEST_FILENAME} -d
   RewriteRule ^ - [L]
   RewriteRule ^ /petclinic/index.html [L]
   ```

5. Restart Apache and open `http://server_name/petclinic/`.
