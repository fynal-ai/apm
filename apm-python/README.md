## Usage

```python
from apm.APMAgent import APMAgent

class Agent:
    def __init__(self):
        self.apmAgent = APMAgent()
        pass

    def run(self, params, saveconfig):
        output = {
            "text": "text"
        }

        self.apmAgent.save_output(saveconfig=saveconfig, output=output) # save output

        return output
```
