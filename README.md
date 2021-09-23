[<img src="https://www.netter.io/assets/images/logo_netter_intero_sfondonero.png" style="width:250px;">](https://www.netter.io/)

# Netter EdgeStack Platform CLI
[![Linux](https://svgshare.com/i/Zhy.svg)](https://svgshare.com/i/Zhy.svg)
[![macOS](https://svgshare.com/i/ZjP.svg)](https://svgshare.com/i/ZjP.svg)
[![Windows](https://svgshare.com/i/ZhY.svg)](https://svgshare.com/i/ZhY.svg)
[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/Naereen/badges)

You can use this program to interact easily with EdgeStack backend.

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
## Install dependencies (optional)

In order to compile this project, stay on your home directory and install: 
- ```node.js```
- ```jq``` (https://stedolan.github.io/jq/download/). You should pipe the output to ```jq``` for better visualization of the query result.

Then go into the root folder of this project and execute:
- ```npm i``` 
- ```npm run compile```

... that's it.

## Setup the environment

First, you should setup as environment variables:
- your ```TENANT_FQDN_NAME``` (for example: yourcompany.cloudprovider.com)
- your ```CONSUMER_API_KEY```

You can set them up session-related environment variables:
- on Linux and MacOS, using ```export NAME=VALUE```
- on Windows, using ```setx NAME "VALUE"```

Tenant name is **required** while consumer API key can be obtained in this way. 
Type on the terminal: ```netter api login``` 

Then type:
- *username* 
- *password*
- *domain* (if any)

Type: ```netter api users get me  | jq '.'``` and copy ```consumer_api_key``` value. Set it as environment variable as above.

# Usage

Syntax: ```<program> <service> <entity> <query> <params>```

Examples: 
- ```<program>```: ```/usr/local/bin/netter``` or simply ```netter```
- ```<service>```: ```api``` or ```s3```
- ```<entity>```: ```users``` or ```enterprises```
- ```<query>```: ```get``` or ```set``` or ```create``` or ```delete```
- ```<params>```: ```all business_sector=financial active=true```

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