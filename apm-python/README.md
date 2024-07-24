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

## Dev

https://developer.aliyun.com/article/1337727

1. change code in `apm` directory
2. change version in `setup.py`
3. build `dist`
   ```sh
   python3.10 -m setup.py sdist
   ```
4. publish to pypi
   ```sh
   python3.10 -m twine upload dist/\*
   ```
