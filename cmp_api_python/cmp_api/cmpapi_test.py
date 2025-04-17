import sys
import os
sys.path.insert(0, str(os.path.dirname(os.path.abspath(__file__)))+'/fake_node_mods') 
from CmpApi import CmpApi 

def decode(gppString, cmpApi):
    try:
        # print(gppString)
        cmpApi.setGppString(gppString)

        obj = cmpApi.getObject()
        if 'tcfeuv2' in obj.keys():
            obj['tcfeuv2']['Created'] = str(obj['tcfeuv2']['Created'])
            obj['tcfeuv2']['LastUpdated'] = str(obj['tcfeuv2']['LastUpdated'])

        if 'tcfcav1' in obj.keys():
            obj['tcfcav1']['Created'] = str(obj['tcfcav1']['Created'])
            obj['tcfcav1']['LastUpdated'] = str(obj['tcfcav1']['LastUpdated'])
        return obj #str(obj)


    except Exception as error:
        print("error-- ", error)