import { Worker, parentPort, isMainThread, SHARE_ENV } from "worker_threads";
import Cache from "./Cache.js";
import { Types } from "mongoose";
import path from "path";
import type { SmtpInfo } from "./EmpTypes.js";
import Tools from "../tools/tools.js";

const frontendUrl = Tools.getFrontEndUrl();

//
// msg: {endpoint: URL,data: JSON}
const callWebApiPosterWorker = async function (msg: object) {
  msg = JSON.parse(JSON.stringify(msg));
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.dirname(__filename) + "/worker/WebApiPosterWorker.js",
      {
        env: SHARE_ENV,
        workerData: msg,
      },
    );
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(
          new Error(`WebApiPosterWorker Worker stopped with exit code ${code}`),
        );
    });
  });
};

const callSendMailWorker = async function (msg: object) {
  try {
    msg = JSON.parse(JSON.stringify(msg));
    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(
          path.dirname(__filename) + "/worker/SendMailWorker.js",
          {
            env: SHARE_ENV,
            workerData: msg,
          },
        );
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0)
            reject(
              new Error(`SendMailWorker Worker stopped with exit code ${code}`),
            );
        });
      } catch (error) {
        console.error(error);
        console.log(JSON.stringify(msg));
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const sendTenantMail = async function (
  tenant: string | Types.ObjectId,
  recipients: string | string[],
  subject: string,
  mail_body: string,
  reason = "DEFAULT",
) {
  console.log(
    `\t==>sendTenantMail ${reason} to`,
    recipients,
    "in ",
    isMainThread ? "Main Thread" : "Child Thread",
  );
  try {
    let msg = {
      CMD: "CMD_sendTenantMail",
      tenant: tenant,
      recipients: recipients,
      cc: "",
      bcc: "",
      subject: subject,
      html: Tools.codeToBase64(mail_body),
      reason: reason,
      smtp: {} as SmtpInfo,
    };
    if (isMainThread) {
      let smtp = await Cache.getOrgSmtp(msg.tenant);
      msg.smtp = smtp;
      await callSendMailWorker(msg);
    } else {
      parentPort.postMessage({ cmd: "worker_sendTenantMail", msg: msg });
    }
  } catch (error) {
    console.error(error);
  }
};

const sendSystemMail = async function (
  recipients: string | string[],
  subject: string,
  mail_body: string,
  reason = "DEFAULT",
) {
  console.log(
    `\t==>sendSystemMail ${reason} to`,
    recipients,
    "in ",
    isMainThread ? "Main Thread" : "Child Thread",
  );
  try {
    let msg = {
      CMD: "CMD_sendSystemMail",
      recipients: recipients,
      subject: subject,
      html: Tools.codeToBase64(mail_body),
      smtp: "System",
    };
    if (isMainThread) {
      await callSendMailWorker(msg);
    } else {
      //注意，不能在sendMailWorker中调用 sendSystemMail， 会造成死循环
      parentPort.postMessage({ cmd: "worker_sendSystemMail", msg: msg });
    }
  } catch (error) {
    console.error(error);
  }
};

const informUserOnNewTodo = async function (inform: any) {
  console.log(
    "\t==>informUserOnNewTodo in ",
    isMainThread ? "Main Thread" : "Child Thread",
  );
  try {
    let sendEmailTo = inform.rehearsal ? inform.wfstarter : inform.doer;
    console.log("\t==>sendEmailTo", sendEmailTo);
    let withEmail = await Cache.shouldNotifyViaEmail(
      inform.tenant,
      sendEmailTo,
    );
    let cn = await Cache.getEmployeeName(
      inform.tenant,
      inform.doer,
      "informUserOnNewTodo",
    );
    let mail_body = `Hello, ${cn}, new task is comming in:
<br/><a href="${frontendUrl}/work/${inform.todoid}">${inform.title} </a><br/>
in Workflow: <br/>
${inform.wftitle}<br/>
started by ${inform.wfstarter}
<br/><br/>

${inform.cellInfo}

  If you email client does not support html, please copy follow URL address into your browser to access it: ${frontendUrl}/work/${inform.todoid}</a>
<br/>
<br/>The task's title is<br/>
${inform.title}

<br/><br/>

Metatocome`;

    let subject = `[New task] ${inform.title}`;
    let extra_body = "";
    if (inform.rehearsal) {
      subject = "Rehearsal: " + subject;
      extra_body = `
<br/>
This mail should go to ${inform.doer} but send to you because this is rehearsal';
`;
    }
    mail_body += extra_body;

    if (withEmail) {
      await sendTenantMail(
        inform.tenant,
        sendEmailTo,
        subject,
        mail_body,
        "NEWTODO_MAIL",
      );
    }

    let markdownMsg = {
      msgtype: "markdown",
      markdown: {
        content: `# ${cn}

          ## ${inform.rehearsal ? "Rehearsal: " : ""}${inform.title}
          
          [Goto task](${frontendUrl}/work/${inform.todoid})
          (${frontendUrl}/work/${inform.todoid})

          WeCom may cut part of the above URL making it works not as expected.
          If you encounter difficulty to view task in WeCom internal browser, please open it in your phone's browser

          The full url is:

          ${frontendUrl}/work/${inform.todoid}

          Of couse, you may also open MTC in your desktop browser to get the full functionalities

          `,
      },
    };
  } catch (err) {
    console.error(err);
  }
};

export default {
  sendTenantMail,
  sendSystemMail,
  informUserOnNewTodo,
  callSendMailWorker,
  callWebApiPosterWorker,
};
