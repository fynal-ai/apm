import requests


class APMAgent:
    def __init__(self):
        pass

    def save_output(self, saveconfig, status = {"done": True}, output = {}):
        """
        save output to apm server
        """
        try:
            url = saveconfig.get("url")
            headers = saveconfig.get("headers")
            
            data = saveconfig.get("data")
            data["output"] = output
            data["status"] = status

            # print("data", data)

            response = requests.post(url=url, headers=headers, json=data)
            response_json = response.json()
            print("response_json", response_json)
            return response_json
        except Exception as e:
            print("Error while saving output to apm server: ", e)
