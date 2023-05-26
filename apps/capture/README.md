
Sample of how to use the container

```ssh
docker run -d --name adsb-capture --network host --env HOSTS="FR24,S-KPAN50,other-host" adsb-container
```

SBKP
```ssh
docker run -d --init --name adsb-capture --network host --env HOSTS="FR24-BC6A29C4A08A,S-KPAN50" -v /home/$USER/adsb-data:/backup --restart unless-stopped adsb-container
```