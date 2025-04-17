#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from DatetimeEncoder import DatetimeEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableDatetime(AbstractEncodableBitStringDataType):
    def __init__(self,value):
        super()
        self.setValue(value)

    def decode(self,bitString):
        self.value = DatetimeEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
        return bitString[fromIndex:fromIndex+36]

# instance = EncodableDatetime('000000000010101010100000011111000010') 
# print(instance.value)
# instance.decode('000000000001101010100000011111000010')
# print(instance.value)
# print(instance.substring('00000000000110101010000001111100001000000',0))