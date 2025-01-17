# Welcome to ATV Backend

The purpose of this repo is to store images clicked by ATV's employees via their barcode into the system.

#### Download the latest postgres image using

`docker pull postgres:17.2`

#### To run a new container use this command

`docker run --name atv-database -d -p 5432:5432 -e POSTGRES_PASSWORD=atvsecret@987654321 postgres:17.2`

#### To enter the docker container use

`docker exec -it atv-database bash`

#### To enter the database

`psql -U postgres`

#### To create the database

`CREATE DATABASE atvbarcode;`

Use /q to exit from psql
Use `exit` to exit from docker container

Steps to follow:
Step1: Check DNS configuration
Step2: Create small backend server
Step2.0: Setup SSH from my local to server
Step2.1: Install Docker
Step2.2: Setup server auth to github
Step2.3: Copy code from Github to server
Step2.4: Setup Postgres
Step2.5: Setup node and yarn
Step2.6: Troubleshoot and start the server
Step2.7: Setup the backend server as the daemon
Step2.8: Install NGINX
Step2.9: Setup NGINX as a reverse proxy to your locally running server and connect DNS to your server. Make sure you whitelist the port 443 in Lightsail
Step2.10: Setup auto-renewing certificates using let's encrypt
Step3: Deploy your frontend on Netlify
Step4: Test out the entire integration
Step5: Database UI setup and setup database backup in S3 and restore database with a cron job
