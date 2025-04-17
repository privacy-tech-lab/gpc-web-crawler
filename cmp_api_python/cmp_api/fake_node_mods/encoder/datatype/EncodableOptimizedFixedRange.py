#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FixedBitfieldEncoder import FixedBitfieldEncoder
from FixedIntegerEncoder import FixedIntegerEncoder
from FixedIntegerRangeEncoder import FixedIntegerRangeEncoder
from EncodableFixedIntegerRange import EncodableFixedIntegerRange
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableOptimizedFixedRange(AbstractEncodableBitStringDataType):
    def __init__(self, value):
        super()
        self.setValue(value)

    def decode(self, bitString):
        if bitString[16] == "1":
            self.value = FixedIntegerRangeEncoder.decode(bitString[17:])
        else:
            value = []
            bits = FixedBitfieldEncoder.decode(bitString[17:])
            for i in range(len(bits)):
                if bits[i] == True:
                    value.append(i + 1)

            self.value = value
    def substring(self, bitString, fromIndex):
        max = FixedIntegerEncoder.decode(bitString[fromIndex:fromIndex+16])
        if bitString[fromIndex + 16] == "1":
            return bitString[fromIndex:fromIndex + 17] + EncodableFixedIntegerRange([]).substring(bitString,fromIndex+17)
        else:
            return bitString[fromIndex : fromIndex + 17 + max]
  
# r = "000011000001000000000001100011110000"
# instance = EncodableOptimizedFixedRange(r) 
# print(instance.value)
# instance.decode(r)
# print(instance.value)
# print(instance.substring(r, 4))