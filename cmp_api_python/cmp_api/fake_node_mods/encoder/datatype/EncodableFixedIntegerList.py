#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FixedIntegerListEncoder import FixedIntegerListEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableFixedIntegerList(AbstractEncodableBitStringDataType):
    def __init__(self, elementBitStringLength, value):
        super()
        self.elementBitStringLength = elementBitStringLength
        self.numElements = len(value)
        self.setValue(value)

    def decode(self, bitString):
        self.value = FixedIntegerListEncoder.decode(bitString, self.elementBitStringLength, self.numElements)

    def substring(self, bitString, fromIndex):
        return bitString[fromIndex:fromIndex + self.elementBitStringLength * self.numElements]
  

# instance = EncodableFixedIntegerList(3, "110011") 
# print(instance.value)
# print(instance.elementBitStringLength)
# print(instance.numElements)
# instance.decode("110011")
# print(instance.value)
# print(instance.substring("110011",2))
