#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FixedStringEncoder import FixedStringEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableFixedString(AbstractEncodableBitStringDataType):
    def __init__(self, stringLength, value):
        super()
        self.stringLength = stringLength
        self.setValue(value)

    def decode(self, bitString):
        self.value = FixedStringEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
 
        return bitString[fromIndex:fromIndex + self.stringLength * 6]
  
# r = "000011000001000000000001100011110000"
# instance = EncodableFixedString(5,r) 
# print(instance.value)
# instance.decode(r)
# print(instance.value)
# print(instance.substring(r,2))
