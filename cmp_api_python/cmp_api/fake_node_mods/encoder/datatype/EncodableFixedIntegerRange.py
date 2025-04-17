#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FixedIntegerEncoder import FixedIntegerEncoder
from FixedIntegerRangeEncoder import FixedIntegerRangeEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableFixedIntegerRange(AbstractEncodableBitStringDataType):
    def __init__(self, value):
        super()
        self.setValue(value)

    def decode(self, bitString):
        self.value = FixedIntegerRangeEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
        count = FixedIntegerEncoder.decode(bitString[fromIndex:fromIndex + 12])
        index = fromIndex + 12
        for i in range(count):
            if index < len(bitString) and bitString[index] == "1":
                index += 33
            else:
                index += 17
        return bitString[fromIndex:index]
  
# r = "00000000001000000000000000011100000000000001010000000000001000"
# instance = EncodableFixedIntegerRange(r) 
# print(instance.value)
# instance.decode(r)
# print(instance.value)
# print(instance.substring(r,2))
