#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from BooleanEncoder import BooleanEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableBoolean(AbstractEncodableBitStringDataType):
    def __init__(self,value):
        super()
        self.setValue(value)

    def decode(self,bitString):
        self.value = BooleanEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
        return bitString[fromIndex:fromIndex+1]

# instance = EncodableBoolean(1) 
# instance.decode('0')
# print(instance.value)
# print(instance.substring('10',1))
