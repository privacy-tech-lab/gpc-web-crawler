#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FixedIntegerEncoder import FixedIntegerEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableFixedInteger(AbstractEncodableBitStringDataType):
    def __init__(self, bitStringLength, value):
        super()
        self.bitStringLength = bitStringLength
        self.setValue(value)

    def decode(self, bitString):
        self.value = FixedIntegerEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
        return bitString[fromIndex:fromIndex + self.bitStringLength]
  

# instance = EncodableFixedInteger(6, "110011") 
# print(instance.value)
# print(instance.bitStringLength)
# instance.decode("110011")
# print(instance.value)
# print(instance.substring("110011",2))
