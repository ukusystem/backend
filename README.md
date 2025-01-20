# uku.backend

Backend del proyecto Uku

# Changelog (controller side)

## 0.4.1

- Feat: Controller connection was not being notified to the web app

## 0.4.2

- Fix: Could not save new vms preference due to not considering some grid options.

## 0.4.3

- Fix: Error when creating a user and then editing it before saving to the database. The 'date' value was being passed as '~' as it is the default value for a new user.
