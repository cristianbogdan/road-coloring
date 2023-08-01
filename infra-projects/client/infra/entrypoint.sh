crond -l2
serve -s /srv/map/dist -p 5173

# # Start processes in background
# crond -f -l2 &
# serve -s /srv/map/dist -p 5173 &

# # Wait for any process to exit
# wait -n

# # Exit with status of process that exited first
# exit $?
