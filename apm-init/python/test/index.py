import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random

from Agent import Agent

# test


input = {"style": "水墨画", "prompt": "无边落木萧萧下，不尽长江滚滚来。"}

saveconfig = {
    "url": "http://127.0.0.1:{{PORT}}/apm/agentservice/result/save",
    "headers": {"Content-Type": "application/json"},
    "data": {
        "access_token": "{{ACCESS_TOKEN}}",
        "runId": (str(random.random()).replace("0.", ""))[1:15],
        "name": "{{AUTHOR}}/{{NAME}}",
        "version": "0.0.1",
        "input": {"style": "水墨画", "prompt": "无边落木萧萧下，不尽长江滚滚来。"},
        "output": {},
    },
}

agent = Agent()

agent.run(input=input, saveconfig=saveconfig)
