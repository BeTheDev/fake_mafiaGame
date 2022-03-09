
openvidu-mvc-node


Visit [docs.openvidu.io/en/stable/tutorials/openvidu-mvc-node/](http://docs.openvidu.io/en/stable/tutorials/openvidu-mvc-node/)

[OpenViduLogo]: https://secure.gravatar.com/avatar/5daba1d43042f2e4e85849733c8e5702?s=120

readme.md
"docker-compose up" 으로 도커파일 불러오기 하면 session을 join 못하는 버그 발생.. 왜그런지 원인찾아야함.....

 docker run -p 4443:4443 --rm -e OPENVIDU_SECRET=MY_SECRET openvidu/openvidu-server-kms:2.21.0 

npm run dev 하면 자동으로 
server.js https://localhost:4443 MY_SECRET 으로 접속..

그런데 app.js로 빠구는거랑 server.js로 바꾸는거랑 에러가 발생함..이것도 원인 찾아야함.
