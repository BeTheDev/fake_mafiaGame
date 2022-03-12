<<<<<<< HEAD
[![License badge](https://img.shields.io/badge/license-Apache2-orange.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Documentation Status](https://readthedocs.org/projects/openvidu/badge/?version=stable)](https://docs.openvidu.io/en/stable/?badge=stable)
[![Docker badge](https://img.shields.io/docker/pulls/openvidu/openvidu-server-kms.svg)](https://hub.docker.com/r/openvidu/openvidu-server-kms)
[![Support badge](https://img.shields.io/badge/support-sof-yellowgreen.svg)](https://openvidu.discourse.group/)

[![][OpenViduLogo]](http://openvidu.io)

openvidu-js-node
===

Visit [docs.openvidu.io/en/stable/tutorials/openvidu-js-node/](http://docs.openvidu.io/en/stable/tutorials/openvidu-js-node/)

[OpenViduLogo]: https://secure.gravatar.com/avatar/5daba1d43042f2e4e85849733c8e5702?s=120
=======

openvidu-mvc-node


Visit [docs.openvidu.io/en/stable/tutorials/openvidu-mvc-node/](http://docs.openvidu.io/en/stable/tutorials/openvidu-mvc-node/)

[OpenViduLogo]: https://secure.gravatar.com/avatar/5daba1d43042f2e4e85849733c8e5702?s=120

readme.md
"docker-compose up" 으로 도커파일 불러오기 하면 session을 join 못하는 버그 발생.. 왜그런지 원인찾아야함.....

 docker run -p 4443:4443 --rm -e OPENVIDU_SECRET=MY_SECRET openvidu/openvidu-server-kms:2.21.0 

npm run dev 하면 자동으로 
server.js https://localhost:4443 MY_SECRET 으로 접속..

그런데 app.js로 빠구는거랑 server.js로 바꾸는거랑 에러가 발생함..이것도 원인 찾아야함.
>>>>>>> f6fe01cb3565b848e7f35dab28c59ab7cd671d75
