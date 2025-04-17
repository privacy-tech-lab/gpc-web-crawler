#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FixedBitfieldEncoder import FixedBitfieldEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableFixedBitfield(AbstractEncodableBitStringDataType):
    def __init__(self,value):
        super()
        self.numElements = len(value)
        self.setValue(value)

    def decode(self, bitString):
        self.value = FixedBitfieldEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
        return bitString[fromIndex:fromIndex + self.numElements]
  

# instance = EncodableFixedBitfield("110011") 
# print(instance.value)
# print(instance.numElements)
# instance.decode("110011")
# print(instance.value)
# print(instance.substring("110011",2))
