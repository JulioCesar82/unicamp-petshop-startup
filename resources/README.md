### Building locally and pushing to dockerhub

```bash
docker build -t jupter-hadoop-pets -f Dockerfile-jupter.development .

docker login

docker tag jupter-hadoop-pets:latest julio471/jupter-hadoop-pets:20.0

docker push julio471/jupter-hadoop-pets:20.0
```