#!/bin/sh

echo "Waiting for database to be ready..."

# Test actual database connection directly
until PGPASSWORD=password psql -h postgres -U postgres -d vehicle_auction_vehicles -c '\q' 2>/dev/null; do
  echo "Database connection failed - sleeping"
  sleep 3
done

echo "Database connection successful!"

echo "Running database migrations..."
npm run prisma:deploy

if [ $? -ne 0 ]; then
  echo "Migration failed, exiting..."
  exit 1
fi

echo "Migrations completed successfully!"
echo "Starting the application..."
exec npm run start:prod