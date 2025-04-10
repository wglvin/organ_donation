# VitalBid, Organ Auction Platform
![Fun Image](dd1efe8a-f16f-4d8e-8456-0e2b5c5e6b65.png)

## Description
Our organ auction platform addresses the critical shortage of accessible organ procurement systems by creating a free marketplace for people who require organs to source for them. The frontend communicates with the backend microservices through the Kong API Gateway, there is ZERO direct frontend interaction with all microservices.


✅ **UNSDG 3 – Good Health and Well-being**  
**How it connects**: The core goal of your platform is to facilitate organ availability and access in a transparent, efficient, and ethical way. By streamlining the listing, bidding, and matching process, your system can help reduce waiting times and improve transplant outcomes.  
**Example**: Timely access to organ transplants saves lives and improves the quality of life for people with critical conditions.

✅ **UNSDG 10 – Reduced Inequalities**  
**How it connects**: If the platform ensures fair access to organs regardless of socioeconomic status or geography, it contributes to reducing healthcare inequality.  
**Example**: By using transparent criteria and smart notifications, everyone in the system has equal opportunity to find the organ they need.

✅ **UNSDG 9 – Industry, Innovation, and Infrastructure**  
**How it connects**: The platform’s use of scalable microservices, Kafka for real-time updates, and integrations for secure messaging and payments represents an innovative digital health infrastructure.  
**Example**: Enables health tech innovation and supports more coordinated organ donation systems.

Key features of our organ auction platform include:
1.	Secure registration for both buyers and sellers
2.	Creation of Organ Types/ Listings
3.	Real-time bidding system for available listings
4.	Allow Early Resolution of a Listing
5.	Support Payments through Stripe Payments API
6.	Receive Email Notification through Mailgun API

Frontend also allows:
1.	View all organ listings with filtering by status (active/ended)
2.	View listing details with bid history
3.	View one's bids/listings

## File Structure
- Frontend Built and Run in frontend-html folder, run by nginx
- Backend Microservices are each in their seperate folder, each run by flask OR node.js

## Prerequisites
- Docker 27.5.1
- Ensure that ports to be used are not currently used by other programs
- Approved Mailgun email request, search for "Mailgun<support@mailgun.net>" in inbox, cXXXXXXt@smu.edu.sg & lXXXXXXg@smu.edu.sg have been requested

## Running Repo 
1. Check if any docker images are already running
   ```sh
   docker ps
   ```
2. Stop any running docker images  
   ```sh
   docker stop <container_id>
   ```

3. Build & Run all docker images in folder ONLY
   ```sh
   docker-compose up -d --build
   ```
   OR
3. Remove database volumes declared (reset tables to fresh state) before building again
   ```sh
   docker-compose down -v && docker-compose up -d --build
   ```

## ENV Variables
1. use .env file within the report

## Outsystem Code
1. Stored in userAuth.oml, within zip

## Docker-Compose-Remote & Kong-remote.yaml
1. If you would like to run bid microservice remotely
2. Clone Repo + Delete docker-compose.yaml file and kong-remote.yaml
3. Rename the remote files to docker-compose.yaml and kong-remote.yaml
4. Change the env file to use the commeneted BIDDING_SERVICE_URL instead and change to the ip of the system u are running on
5. Do the same for the docker-compose and kong routings to reference the new ip

## External Ports in Use
3000: Frontend Application </br>
3001: List Microservice </br>
3002: Bid Microservice </br>
3003: Notification Microservice </br>
3004: Resolve Microservice </br>
3306: List Database </br>
3307: Bid Database </br>
3308: Resolve Database </br>
5001: View Listing & Bid Microservice </br>
5002: Payments Microservice </br>
8000: Kong API Gateway </br>
8001: Kong Admin </br>
9093: Kafka Microservice </br>
22182: Zookeeper Service </br>

## Troubleshooting Guidelines 
When unable to use e.g. port 3306, use the following command (in case your mysql/other service is running):
* 1. (Windows - kill mysql)
```sh
taskkill /IM mysqld.exe /F
```
* 1. (MacOS - find PID using)
```sh
sudo lsof -i :3306 
```
* 2. (MacOS - kill process by PID)
```sh
sudo kill -9 <PID>
```
## Enabling Notifications from VitalBid
1. Look for an email from support@mailgun.net
2. Click 'I Agree' in the email.
3. After clicking agree, VitalBids will send notifications to you via email from postmaster@sandbox65242f474b894e96829c45f1dba5c060.mailgun.org. Emails from this address will initially be quarantined by Microsoft Defender.
4. Create a listing on VitalBid to first trigger this email, to which an email will be quarantined.
5. Head to Microsoft Defender and navigate to the quarantined emails.
6. Find an email from postmaster, and click "release message".
7. Click "Trust sender".
8. Now you can continually receieve emails from VitalBid via Mailgun.

For more information of the guide, see the appendix of the report.

## Contributing Guidelines
When contributing to this project, please follow these commit message guidelines:
* For changes specific to an Image: "[Image]: [Message]"
* For project-wide changes: "Project: [Message]"

