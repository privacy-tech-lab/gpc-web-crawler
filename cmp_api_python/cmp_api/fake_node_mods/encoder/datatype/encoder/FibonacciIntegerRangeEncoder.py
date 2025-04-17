#### adapted from JS code from this library: https://www.npmjs.com/package/@iabgpp/cmpapi
from FibonacciIntegerEncoder import FibonacciIntegerEncoder
from BooleanEncoder import BooleanEncoder
from FixedIntegerEncoder import FixedIntegerEncoder

class FibonacciIntegerRangeEncoder:
    def decode(bitString):
        for i in bitString:
            if i not in ["0","1"]:
                raise Exception("Undecodable FibonacciIntegerRange '" + bitString + "'")
        if len(bitString) < 12:
            raise Exception("Undecodable FibonacciIntegerRange '" + bitString + "'")
        value = []
        count = FixedIntegerEncoder.decode(bitString[0:12])
        offset = 0
        startIndex = 12
        for i in range(count):
            group = BooleanEncoder.decode(bitString[startIndex: startIndex + 1])
            startIndex += 1
            if group == True:
                # a is str, b is the
                index = bitString[startIndex:].find("11") + startIndex # add back startIndex to get index in init list
                start = FibonacciIntegerEncoder.decode(bitString[startIndex:index + 2]) + offset
                offset = start
                startIndex = index + 2
                index = bitString[startIndex:].find("11") + startIndex # add back startIndex to get index in init list
                end = FibonacciIntegerEncoder.decode(bitString[startIndex:index+2]) + offset
                offset = end
                startIndex = index + 2
                for j in range(start, end+1):
                    value.append(j)
            else:
                index = bitString[startIndex:].find("11") + startIndex # add back startIndex to get index in init list
                val = FibonacciIntegerEncoder.decode(bitString[startIndex:index+2]) + offset
                offset = val
                value.append(val)
                startIndex = index + 2
        return value

# print(FibonacciIntegerRangeEncoder.decode('000000000001100011110000'))
# print(FibonacciIntegerRangeEncoder.decode("000000000010001101011000"))