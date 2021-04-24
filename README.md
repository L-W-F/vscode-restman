![image](./restman.png)

[![Node CI](https://github.com/crossjs/vscode-restman/workflows/Node%20CI/badge.svg?event=push)](https://github.com/crossjs/vscode-restman/actions?query=workflow%3A%22Node+CI%22)
[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version-short/crossjs.vscode-restman.svg)](https://marketplace.visualstudio.com/items?itemName=crossjs.vscode-restman)
[![Downloads](https://vsmarketplacebadge.apphb.com/downloads/crossjs.vscode-restman.svg)](https://marketplace.visualstudio.com/items?itemName=crossjs.vscode-restman)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/crossjs.vscode-restman.svg)](https://marketplace.visualstudio.com/items?itemName=crossjs.vscode-restman)
[![Rating](https://vsmarketplacebadge.apphb.com/rating/crossjs.vscode-restman.svg)](https://marketplace.visualstudio.com/items?itemName=crossjs.vscode-restman)

# RESTMAN

一个可以执行与模拟 RESTful 请求的 VS Code 插件。

<!-- ![image](https://user-images.githubusercontent.com/1201028/112718320-3034d080-8f2d-11eb-8d75-c716aef67160.png) -->

## 示例

新建一条 TODO 信息

    ### [POST] /api/todos

    ```json.req
    {
      "type": "object",
      "properties": {
        "data": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string",
              "maxLength": 500
            }
          },
          "required": ["content"]
        }
      },
      "required": ["data"]
    }
    ```

## 功能

### 接口定义

建议声明 [RESTful][1] 风格的接口，充分利用 `GET`、`POST`、`PUT`、`PATCH`、`DELETE` 等请求方法，尽量保证接口的简洁明了。

除了定义方法与地址外，还可以使用 [JSON Schema][2] 定义请求与响应的格式。

#### 方法

`GET` | `POST` | `PUT` | `DELETE` | `PATCH` | `HEAD` | `OPTIONS` | `CONNECT` | `TRACE`

#### 地址

以 `/` 开头，不允许空格，比如 `/api/whoami`。

#### 请求消息

允许使用 JSON Schema 定义请求消息头（headers）与请求消息体（data）。

#### 响应消息

允许使用 JSON Schema 定义响应状态（status）、响应消息头（headers）与响应消息体（data）。

### 接口模拟

根据接口定义中 `json.res` 块的 Schema，结合 [JSON Schema Faker][3] 自动响应符合规范的消息。

⚠️ 启用此功能时，如果环境变量 `ORIGIN` 中定义的端口（未定义则使用 `3000`）被占用，则会报错。

### 变量替换

可以使用 `{{@?[\w._]+}}` 声明接口中的变量，如 `{{ID}}`，接口应用时会自动替换为环境变量（dotenv）或用户输入，其中以 `@` 开头的变量将替换为文件选择。

#### 环境变量

读取 workspace 中的 [dotenv](#dotenvFiles) 变量，用于定义请求信息中的变量，其中 `ORIGIN` 变量用于生成默认 `baseURL` 与启动模拟服务器。

#### 用户输入

发起请求前，通过编辑器的选择框、输入框、文件选择框等界面，定义未在 dotenv 中找到的变量。

### 伪数据

点击 Schema 块上方的 `Faker` 链接，可以生成伪数据，参见 [JSON Schema Faker][3]。

### 检查与格式化

#### 检查

自动检查 Schema 是否合法，并给出提示。

#### 格式化

点击 Schema 块上方的 `Format` 链接，可以格式化 JSON Schema。

### 文档

基于文档模板，可以预览与生成 Markdown 格式、对非接口开发人员友好、适用于对外发布的接口文档。

#### 预览

点击 .rest 文件标题栏右侧的 Doc 按钮，可以预览生成的 Markdown 文档。

#### 生成

在命令面板中执行 `RESTMAN: Generate` 可以生成当前 Workspace 下所有 .rest 文件对应的 Markdown 文档。


### 格式转化

🚧 与 Swagger、Postman、YAPI 等接口管理工具互转

## 配置项

### enable

默认值：`true`

是否启用插件

### mockServer

默认值：`false`

是否启用模拟服务器
### dotenvFiles

默认值：`**/.{env,env.local,env.development.local}`

匹配当前 workspace 下 dotenv 文件

## 相关依赖

- [ajv](https://ajv.js.org/)
- [axios](https://github.com/axios/axios)
- [dotenv](https://github.com/motdotla/dotenv)
- [form-data](https://github.com/form-data/form-data)
- [formidable](https://github.com/node-formidable/formidable)
- [json-schema-faker][3]
- [lodash](https://lodash.com/)
- [micromatch](https://github.com/micromatch/micromatch)
- [tough-cookie](https://github.com/salesforce/tough-cookie)

[1]: https://zh.wikipedia.org/wiki/表现层状态转换
[2]: https://json-schema.org/
[3]: https://json-schema.org/
