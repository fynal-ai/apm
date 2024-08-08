import requests


class APMAgent:
    def __init__(self):
        pass

    def save_output(self, saveconfig:dict, output = {}):
        """
        save output to callback server(optional) and apm server
        """
        config = saveconfig.get("remoteRunSaveResultOption")
        if config and config.get("url"):
            print('Try save output to callback server')
            try:
                url = config.get("url")
                headers = config.get("headers")
                
                data = config.get("data")
                data["output"] = output

                # print("data", data)

                response = requests.post(url=url, headers=headers, json=data)
                response_json = response.json()
                print("Callback server response_json", response_json)
            except Exception as e:
                print("Error while saving output to callback server: ", e)
            saveconfig.pop("remoteRunSaveResultOption")

        try:
            url = saveconfig.get("url")
            headers = saveconfig.get("headers")
            
            data = saveconfig.get("data")
            data["output"] = output

            # print("data", data)

            response = requests.post(url=url, headers=headers, json=data)
            response_json = response.json()
            print("response_json", response_json)
            return response_json
        except Exception as e:
            print("Error while saving output to apm server: ", e)
