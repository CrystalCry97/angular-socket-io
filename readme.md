# Build
```
sudo docker build -t amalsyahmi97/angular-socket-server:v1 .
sudo docker build -t amalsyahmi97/angular-socket-server:v1 .
```
# Run service
```
sudo docker service create --publish 4200:80 --name server amalsyahmi97/angular-socket-client:v1
sudo docker service create --publish 5000:5000 --name server amalsyahmi97/angular-socket-server:v1
```
