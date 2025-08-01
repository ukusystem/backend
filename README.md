# uku.backend

Backend del proyecto Uku

## Changelog (controller side)

### 0.4.1

- Feat: Controller connection was not being notified to the web app

### 0.4.2

- Fix: Could not save new vms preference due to not considering some grid options.

### 0.4.3

- Fix: Error when creating a user and then editing it before saving to the database. The 'date' value was being passed as '~' as it is the default value for a new user.

### 0.7.0

- Added FCM support.

---

## Prodedure to install the backend

- Create `.env` (copy `.env.example`) and edit with proper values.
- Delete script `prepare` from `package.json` Install modules `npm install --omit=dev`.
- Install MySQL server. Run script `dbTemplate_v0.7.sql` to create database. Edit `.env` with the database credentials.
- MQTT version: sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
