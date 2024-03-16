# Postgres

window:

- "psql" should be added first in environment
- login: psql postgres <postgres_user>, ex: psql postgres postgres

linux: sudo -u postgres psql

## Create user & grant privileges for user

create user <user_name> with encrypted password <password>
grant all privileges on database <database> to <user_name>
\c database
grant all on schema public to <user_name>
