import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random

from Agent import Agent

# test


input = {"style": "水墨画", "prompt": "无边落木萧萧下，不尽长江滚滚来。"}

agent = Agent()

agent.run(input=input)
