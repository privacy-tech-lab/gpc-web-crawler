#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
import sys
sys.path.insert(0, './encoder') # adding encoder to the system path
from FibonacciIntegerEncoder import FibonacciIntegerEncoder
from AbstractEncodableBitStringDataType import AbstractEncodableBitStringDataType

class EncodableFibonacciInteger(AbstractEncodableBitStringDataType):
    def __init__(self,value):
        super()
        self.setValue(value)

    def decode(self,bitString):
        self.value = FibonacciIntegerEncoder.decode(bitString)

    def substring(self, bitString, fromIndex):
        index = bitString[fromIndex:].find("11") + fromIndex # add back startIndex to get index in init list
        if index > 0:
            return bitString[fromIndex:index + 2]
        else:
            return bitString

# instance = EncodableFibonacciInteger('001101011011') 
# print(instance.value)
# instance.decode('001101011011')
# print(instance.value)
# print(instance.substring('001101011011',4))