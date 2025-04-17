#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FibonacciIntegerRangeEncoder import FibonacciIntegerRangeEncoder
from FixedIntegerEncoder import FixedIntegerEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableFibonacciIntegerRange(AbstractEncodableBitStringDataType):
    def __init__(self,value):
        super()
        self.setValue(value)

    def decode(self,bitString):
        self.value = FibonacciIntegerRangeEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
        count = FixedIntegerEncoder.decode(bitString[fromIndex:fromIndex + 12])
        index = fromIndex + 12

        for i in range(count):
            # if 11 isn't found, we don't want to add back index, 
            # we want to start back at string's beginning
            if bitString[index+1:].find("11") == -1:
                idx = bitString[index+1:].find("11") + 2
            else:
                idx = bitString[index+1:].find("11") + 2 + index + 1

            if index < len(bitString) and bitString[index] == "1":
                index = bitString[idx:].find("11") + idx + 2
            else:
                index = idx
        return bitString[fromIndex:index]


    

# instance = EncodableFibonacciIntegerRange("0000000000100001110110011") 
# print(instance.value)
# instance.decode("0000000000100001110110011")
# print(instance.value)
# print(instance.substring("0000000000100001110110011",2))
