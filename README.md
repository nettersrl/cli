[<img src="https://www.netter.io/assets/images/logo_netter_intero_sfondonero.png" style="width:250px;">](https://www.netter.io/)

# Netter EdgeStack Platform CLI

[![CDUploadRelease Actions Status](https://github.com/nettersrl/cli/workflows/CDUploadRelease/badge.svg)](https://github.com/nettersrl/cli/actions)

You can use this program to interact easily with EdgeStack backend.
This program behaves just like every other CLI program: prints the main output in *stdout* and the errors in *stderr*.
The program prints the events in realtime and returns the result when the process is finished.

Under the hood we use HTTP and socket.io (websockets) to catch events in realtime from the backend. Feel free to reproduce and port this program in your favourite programming language or just spawn it using your favourite I/O library!

Also, the program supports two types of authentication:
- JWT based: this allows you to authenticate using your credentials and your token
- API key based: this allows you to call the backend without the need to provide credentials when the JWT session is not active

# Setup

| Binaries
---

You can find compiled executables here:
- Windows x64: 
- Linux x64: 
- MacOS x64:
- MacOS ARM:

You can create a shortcut to call the CLI utility using ```netter```. You should move the downloaded file to:
- Linux and MacOS: ```sudo mv <file> /usr/local/bin/netter && sudo chmod +x /usr/local/bin/netter```
- Windows: ```sudo mv <file> /usr/local/bin/netter && sudo chmod +x /usr/local/bin/netter```

Now run: ```netter``` on your terminal to use the program.

| Source code
----
## Install dependencies

In order to compile this project, install these software using your OS-specific package managers/installers: 
- ```node.js``` : https://nodejs.org/it/
- ```jq``` : https://stedolan.github.io/jq/download/ 

Tips: 
- You should pipe the output to ```jq``` for better visualization of the query result, appending ```| jq '.'``` to your command.

Then go into the root folder of this project and execute:
- ```npm i``` 
- ```npm run compile```

## Setup the environment

First, you should setup as environment variables:
- your ```TENANT_FQDN_NAME``` (for example: yourcompany.cloudprovider.com)
- your ```CONSUMER_API_KEY``` (optional)

You can set them up session-related environment variables:
- on Linux and MacOS, using ```export NAME=VALUE```
- on Windows, using ```setx NAME "VALUE"```

Tenant name is **required** while consumer API key can be undefined. In that case, the interactive authentication will be required. The interactive JWT-based authentication requires credentials and token, that can be passed: 
- to stdin in an interactive way
- to ```<options>``` as a parameter

However using this program with a ```CONSUMER_API_KEY``` is strongly recommended and this is the procedure to obtain it using this CLI program:

Type on the terminal: ```netter api login``` 

When asked type:
- *username* 
- *password*
- *domain* (if any)

Type: ```netter api users get me  | jq '.'``` and copy ```consumer_api_key``` value. Set it as environment variable as above.

# Usage

Syntax: ```<program> <options> <service> <entity> <query> <params>```

Examples: 
- ```<program>```: ```/usr/local/bin/netter``` or simply ```netter```
- ```<options>```: (optional) ```--username john --token 1214215```
- ```<service>```: ```api``` or ```s3```
- ```<entity>```: ```users``` or ```enterprises```
- ```<query>```: ```get``` or ```getById``` or ```set``` or ```create``` or ```delete```
- ```<params>```: ```all business_sector=financial active=true``` or ```<uuidv4>```

Lookup the service manual by executing: ```<executable> <service> help```

Supported ```service``` are:
- ```api```

# License

Copyright (C) 2021 Netter srl

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.