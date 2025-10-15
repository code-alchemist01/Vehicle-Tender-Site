#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE vehicle_auction_auction;
    CREATE DATABASE vehicle_auction_auth;
    CREATE DATABASE vehicle_auction_vehicles;
    CREATE DATABASE vehicle_auction_bid;
    CREATE DATABASE vehicle_auction_payment;
    CREATE DATABASE vehicle_auction_notification;
    
    GRANT ALL PRIVILEGES ON DATABASE vehicle_auction_auction TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE vehicle_auction_auth TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE vehicle_auction_vehicles TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE vehicle_auction_bid TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE vehicle_auction_payment TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE vehicle_auction_notification TO $POSTGRES_USER;
EOSQL

echo "All databases created successfully!"