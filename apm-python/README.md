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
        status = {
            "done": True
        }

        self.apmAgent.save_output(saveconfig=saveconfig, status=status, output=output) # save output

        return output
```
