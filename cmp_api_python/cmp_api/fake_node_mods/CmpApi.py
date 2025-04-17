#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi

import sys
import os
sys.path.insert(0, str(os.path.dirname(os.path.abspath(__file__)))+'/encoder') 

from GppModel import GppModel

class CmpApi:
    def __init__(self):
        self.gppModel = GppModel('')

    def setGppString(self, encodedGppString):
        self.gppModel.decode(encodedGppString)
        
    def getObject(self):
        return self.gppModel.toObject()