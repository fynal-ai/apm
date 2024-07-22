![WorkflowGPT Logo](frt/static/images/workgpt_logo.png) <!-- Replace with your logo path -->

> **Introducing WorkGPT**: AI-native BMP engine, the fusion of BPM workflow technology with GPT. This innovation brings AI-powered workflow engines to the forefront, seamlessly integrating ChatGPT into enterprise scenarios.

> It's AI Era now, if you are building a Workflow, or BPM (Business Process Management), or RPA (Robotic Process Automation) system, or any other system that involves workflow, you can use WorkGPT to enhance your system with AI capabilities.

> Unlike other existing BPM engines which require Java to develop enterprise workflow application, You may use any modern language to develop enterprise workflow applications with WorkGPT, although itself is developed with Node.js.

![build](https://img.shields.io/badge/build-passing-brightgreen)
![version](https://img.shields.io/badge/version-1.2.3-blue)
![license](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

1. **GPT-Powered Decision Support System**:

   - Analyzes workflow and business objects for better decision-making.
   - Recommends decisions with estimated outcomes.

2. **Natural Language Interface**:

   - Embedded ChatGPT chatbot in the workflow UI.
   - Dynamic conversations on workflow and business subjects.

3. **Generate Workflow Template via Natural Language**:

   - Describe your process; AI crafts the workflow template.

4. **Workflow Enhancement**:

   - Refines workflow templates based on real-time data.

5. **Comprehensive Workflow Engine**:
   - Includes a designer, process driver, and runtime monitor.
   - H5 UI for end-users; robust API for developers.

## 📸 Demo site

(At this moment, please wait for a while, we are preparing the demo site for you.)

## 🚀 Getting Started

### Pre-requisites

1. Node.js 14.17.0 or above
2. Mongodb instance which you can access, you should have a correct connnection string to your Mongodb instance, for example: "mongodb://127.0.0.1:27017/emp"; you will configure it in your "setenv.sh" script later. Make sure your mongodb instance has replicaSet enabled. <a href="#mongodb-replicaset">see here for details</a>
3. Redis instance which you can access, you should have a correct connnection string to your Redis instance, for example: "redis://default:foobared@localhost:6379"; you will configure it in your "setenv.sh" script later.
4. SMTP server which you can access, you should have SMTP server address, port, user name and password ready; you will configure them in your "setenv.sh" script later.
5. Caddy server is used as a reverse proxy server with https enabled, it's helpful for local development environment. for example, we use 'workgpt.localhost' as the server name for backend server, 'lkh.ai.localhost' as the web front server name. so we should have this in '/etc/hosts'

```
127.0.0.1       workgpt.localhost
127.0.0.1       lkh.ai.localhost
```

and this in Caddyfile:

```
workgpt.localhost {
    reverse_proxy http://localhost:5008
}
lkh.ai.localhost {
    reverse_proxy http://localhost:6173
}
```

Run 'caddy start' to start caddy server

### Installation

#### From Source:

1. Clone this repository and enter workgpt folder;

```
git clone git@github.com:cnshsliu/workgpt.git
cd workgpt
```

3. Run npn install:

```

$ npm install

```

or 'pnpm install' if you prefer pnpm.

### Start WorkGPT server

While you are in your workgpt folder, follow next steps to start WorkGPT server:

Step 1. compile typescript source files:

```

$ node run dev.tsc.once

```

Step 2. Prepare environment
Run installer script:

```
$ ./installer/installer.sh
$ vim setenv.sh

```

"installer.sh" will generate "setenv.sh" for you, you MUST edit generated "setenv.sh", change environment variables value according to your environment.

Step 3. then, start the backend server with "./start.sh"

```

$ ./start.sh

```

Step 4. Initialize site data

```

node ./build/tools/db/init_site.js

```

Step 5. Start the Frontend server

Open a new terminal window, then goto "workgpt/frt"

```
cd frt
npm run dev

```

## 📘 User Guide

### Register a new user

1. Open your browser, go to https://lkh.ai.localhost/register

### For Administrators:

- Manage organizations, users, roles, and more.

#### For Workflow Designers:

- Design workflows with WorkGPT Designer.
- Generate & enhance workflow templates.

#### For End-Users:

- Initiate workflows, review personal worklists, handle tasks.

#### For Developers:

- Integrate the engine into applications with API.

#### For Business Analysts:

- Engage with the engine for business process insights.

## 🤝 Contributing

We welcome contributions! Please see our [Contribution Guidelines](link-to-contribution-guidelines).

## 💬 Support & Community

Join our [Slack channel](link-to-slack) or visit our [Forum](link-to-forum) for support and to connect with other users.

## 📄 License

This project is licensed under the [MIT License](link-to-license).

## 🗺 Roadmap

- Feature 1 planned...
- Enhancement 2 coming...

## ❓ FAQ

- **What if our company already has workflow system?** - Integrate .
- **Question 2** - Answer here.

## 🙏 Acknowledgments

Thanks to our amazing contributors and supporters!

## 🌟 Star & Share

If you find this project helpful, please star the repo! Sharing is caring!

```

```

## More

### MongoDB ReplicaSet

You must enable replicaSet for your MongoDB instance to run WorkGPT.

Here we use a local mongodb instance running in docker as an example.
Following command start a Mongodb community server on local docker with replicaset enabled

```

    docker run --rm --name myMongo -d -p 27017:27017 -u $(id -u):$(id -g) -v $HOME/mongodb6:/data/db mongodb/mongodb-community-server:latest --dbpath /data/db --replSet rs0

```

The above command mount local folder '$HOME/mongodb6' to container's '/data/db'. if this folder is not empty before start this server for the first time. please clean it up.

Once server is up, you may run 'mongo' or 'mongosh' client to connect to it, then run following command to initialize the replicaSet:

```

    rs.initiate()

```
