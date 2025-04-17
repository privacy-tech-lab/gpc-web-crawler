#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, '../field') 

from UspV1Field import UspV1Field

class UspV1:
    ID = 6
    VERSION = 1
    NAME = 'uspv1'
    def __init__(self, encodedString):
        self.fields = {
            str(UspV1Field['VERSION']) : UspV1.VERSION,
            str(UspV1Field['NOTICE']) : '-',
            str(UspV1Field['OPT_OUT_SALE']) : '-',
            str(UspV1Field['LSPA_COVERED']) : '-'
        }
        if encodedString and len(encodedString) > 0:
            self.decode(encodedString)

    def setFieldValue(self, fieldName, value):
        if fieldName in self.fields:
            self.fields[fieldName] = value
        else:
            raise Exception(fieldName + " not found")
    def toObj(self):
        obj = {}
        for fieldName in self.fields.keys():
            value = self.fields[fieldName]
            obj[str(fieldName)] = value
        return obj

    def decode(self, encodedString):
        self.setFieldValue(str(UspV1Field['VERSION']), int(encodedString[0]) )
        self.setFieldValue(str(UspV1Field['NOTICE']), encodedString[1])
        self.setFieldValue(str(UspV1Field['OPT_OUT_SALE']), encodedString[2])
        self.setFieldValue(str(UspV1Field['LSPA_COVERED']), encodedString[3])