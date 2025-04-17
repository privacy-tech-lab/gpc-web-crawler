#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FixedBitfieldEncoder import FixedBitfieldEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableFlexibleBitfield(AbstractEncodableBitStringDataType):
    def __init__(self, getLength, value):
        super()
        self.getLength = getLength
        self.setValue(value)

    def decode(self, bitString):
        self.value = FixedBitfieldEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
        return bitString[fromIndex:fromIndex + self.getLength]

  
# r = "000011000001000000000001100011110000"
# instance = EncodableFlexibleBitfield(5,r) 
# print(instance.value)
# print(instance.getLength)
# instance.decode(r)
# print(instance.value)
# print(instance.substring(r,4))
